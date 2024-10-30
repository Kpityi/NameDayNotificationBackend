import { Request, Response, RequestHandler } from "express";
import db from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer";
import { FRONTEND_URL, JWT_SECRET } from "../config/environment";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface userData extends Request {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

// Registration
export const signup: RequestHandler = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password }: userData = req.body;

  const sendConfirmation = async (email: string) => {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    const url = `${FRONTEND_URL}/confirmation/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Email megerősítése",
      html: `Kérem erősítse meg e-mail címét: <a href="${url}">kattintson ide!</a>`,
    });
  };

  //check user alrady exists
  const isUserSql = "SELECT `isValid` FROM `users` WHERE email=?";

  try {
    const result = await db.query<RowDataPacket[]>(isUserSql, [email]);

    if (result.length > 0 && result[0].isValid === 1) {
      res.status(409).json({
        message: "Ez az e-mail cím már létezik, kérem jelentkezzen be!",
      });
      return;
    } else if (result.length > 0 && result[0].isValid === 0) {
      sendConfirmation(email);

      res.status(409).json({
        message:
          "Ez az e-mail cím már létezik, kérem aktiválja fiókját! Új aktiváló e-mailt küldtük.",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Regisztráció sikertelen" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const insertUserSql =
    "INSERT INTO `users`(`first_name`, `last_name`, `email`, `password`) VALUES (?,?,?,?)";

  try {
    const result = await db.query(insertUserSql, [
      firstName,
      lastName,
      email,
      hashedPassword,
    ]);

    sendConfirmation(email);

    res.status(201).json({ message: "Sikeres regisztráció" });
  } catch (error) {
    res.status(500).json({ error: "Regisztráció sikertelen" });
  }
};

export const confirmEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  const sql = "UPDATE users SET isValid = true WHERE email = ?";

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const result = await db.query<ResultSetHeader>(sql, [decoded.email]);

    if (result.affectedRows === 1) {
      res.status(200).json({
        message: "Email megerősítése sikeres, kérem jelentkezzen be.",
      });
      return;
    } else {
      res
        .status(409)
        .json({ error: "Érvénytelen vagy lejárt adatok kérem próbálja újra" });
      return;
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Érvénytelen vagy lejárt adatok kérem próbálja újra" });
  }
};
