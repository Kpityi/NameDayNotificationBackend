import { Request, Response, RequestHandler } from "express";
import db from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer";
import { FRONTEND_URL, JWT_SECRET, TOKEN_SECURE } from "../config/environment";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface userData extends Request {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

const sendConfirmation = async (email: string) => {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
  const url = `${FRONTEND_URL}/confirmation/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Email megerősítése",
    html: `Kérem erősítse meg e-mail címét: <a href="${url}">kattintson ide!</a>`,
  });
};

// Registration
export const signup: RequestHandler = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password }: userData = req.body;

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

export const login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password }: userData = req.body;

  const isUser = `SELECT users.id AS id, 
                         first_name, 
                         last_name, 
                         email, 
                         password, 
                         registration_date, 
                         roles.role AS role, 
                         isValid 
                    FROM users
                    INNER JOIN roles ON role_id=roles.id
                    WHERE email=?;`;

  try {
    const result = await db.query<RowDataPacket[]>(isUser, [email]);
    console.log("result: ", result); //pityi
    if (result.length > 0) {
      if (!(result[0].isValid === 1)) {
        sendConfirmation(email);
        res.status(409).json({
          message: "Kérem aktiválja fiókját! Új aktiváló e-mailt küldtük.",
        });
        return;
      }
      if (await bcrypt.compare(password, result[0].password)) {
        const userId = result[0].id;
        const token = jwt.sign({ userId: userId }, JWT_SECRET, {
          expiresIn: "24h",
        });

        const { password, ...user } = result[0];

        res.cookie("token", token, {
          httpOnly: true,
          secure: TOKEN_SECURE,
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json(user);
        return;
      } else {
        res.status(409).json({ message: "Hibás jelszó" });
        return;
      }
    }
    res.status(409).json({ message: "Hibás, vagy nem létező email cím" });
    return;
  } catch (error) {
    res.status(500).json(error);
  }
};
