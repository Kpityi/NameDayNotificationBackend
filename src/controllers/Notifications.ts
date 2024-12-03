import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/environment";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import transporter from "../config/nodemailer";

interface NotificationsProps {
  nameDays: object;
  occasions: object;
  custom: object;
}
interface sendEmailToProps {
  userId: number;
  name_day_today: string;
  name_day_3_day_befor: string;
  email: string;
  last_name: string;
}

export const getNotifications = async (req: Request, res: Response) => {
  const token = jwt.verify(req.cookies?.token, JWT_SECRET) as {
    userId: string;
  };
  console.log(token);

  const userId: string = token.userId;
  const notifications: NotificationsProps = {
    nameDays: [],
    occasions: [],
    custom: [],
  };

  //get name days notifications

  const sqlNamedays = `SELECT ndn.id, 
                              nd.month, 
                              nd.day, 
                              nd.name 
                        FROM name_day_notifications AS ndn 
                        INNER JOIN name_days AS nd ON ndn.name_day_id = nd.id
                        WHERE ndn.user_id = ?; `;

  //get Occasion notifications

  const sqlOccasions = `SELECT  id, 
                                month, 
                                day, 
                                occasion 
                        FROM occasions_notifications WHERE user_id=?`;

  //get Custom notifications

  const sqlCustom = `SELECT id, date, text FROM custom_notifications WHERE user_id=?`;

  try {
    const nameDaysResult = await db.query(sqlNamedays, [userId]);
    notifications.nameDays = nameDaysResult;
    const occasionsResult = await db.query(sqlOccasions, [userId]);
    notifications.occasions = occasionsResult;
    const customResult = await db.query(sqlCustom, [userId]);
    notifications.custom = customResult;
    res.status(201).json(notifications);
  } catch (error) {
    res.status(409).json({ error: error });
  }
};

export const deleteNameDayNotificaction = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;
  console.log("name day id: ", id); //pityi

  const sql = "DELETE FROM name_day_notifications WHERE id=?";

  try {
    const result = await db.query<ResultSetHeader>(sql, [id]);
    if (result.affectedRows) {
      res.status(200).json({ message: "Értesítés törlése sikeres!" });
    }
  } catch (error) {
    res.status(409).jsonp(error);
  }
};

export const deleteOccasionNotificaction = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;
  console.log("occasion id: ", id); //pityi
  const sql = "DELETE FROM occasions_notifications WHERE id = ?";

  try {
    const result = await db.query<ResultSetHeader>(sql, [id]);
    if (result.affectedRows) {
      res.status(200).json({ message: "Értesítés törlése sikeres!" });
    }
  } catch (error) {
    res.status(409).jsonp(error);
  }
};

export const deleteCustomNotificaction = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;
  console.log("custom id: ", id); //pityi
  const sql = "DELETE FROM custom_notifications WHERE id=?";

  try {
    const result = await db.query<ResultSetHeader>(sql, [id]);
    if (result.affectedRows) {
      res.status(200).json({ message: "Értesítés törlése sikeres!" });
    }
  } catch (error) {
    res.status(409).jsonp(error);
  }
};

export const addNameDayNotification = async (req: Request, res: Response) => {
  const id = req.params.id;

  const token = jwt.verify(req.cookies?.token, JWT_SECRET) as {
    userId: string;
  };
  const userId: string = token.userId;
  console.log(`user id: ${userId}; id: ${id}`); //pitiy
  const sql =
    "INSERT INTO `name_day_notifications`(`user_id`, `name_day_id`) VALUES (?,?)";

  try {
    const result = await db.query<ResultSetHeader>(sql, [userId, id]);
    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "Új névnap emlékeztető hozzáadása sikeres!" });
    }
  } catch (error) {
    res.status(409).json({
      message: "Emlékeztető hozzáadása sikertelen, kérjük próbálja meg később",
    });
  }
};

export const sendNotificationEmail = async (req: Request, res: Response) => {
  const dayInMilisecond = 1000 * 60 * 60 * 24;
  const today = new Date();
  const threeDayBefore = new Date(Number(today) + dayInMilisecond * 3);
  //const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  //const threeDayBeforeYear = threeDayBefore.getFullYear();
  const threeDayBeforeMonth = threeDayBefore.getMonth() + 1;
  const threeDayBeforeDay = threeDayBefore.getDate();
  const sendEmailTo: sendEmailToProps[] = [];

  //SQL: name day query three days earlier
  const namedayNotification3DayBeforeSql = `SELECT  ndn.user_id, 
                                                    nd.name, 
                                                    users.email,
                                                    users.last_name 
                                                FROM name_day_notifications AS ndn 
                                                INNER JOIN name_days AS nd ON ndn.name_day_id=nd.id
                                                INNER JOIN users ON ndn.user_id=users.id                                                 
                                                WHERE nd.month=? AND nd.day=?`;

  //SQL: name days today
  const namedayNotificationTodaySql = `SELECT ndn.user_id, 
                                              nd.name, 
                                              users.email,
                                              users.last_name 
                                          FROM name_day_notifications AS ndn 
                                          INNER JOIN name_days AS nd ON ndn.name_day_id=nd.id
                                          INNER JOIN users ON ndn.user_id=users.id                                             
                                          WHERE nd.month=? AND nd.day=?`;

  try {
    //name day notification 3 days earlier
    const resultnameDay3DaysBefore = await db.query<RowDataPacket[]>(
      namedayNotification3DayBeforeSql,
      [threeDayBeforeMonth, threeDayBeforeDay]
    );
    if (resultnameDay3DaysBefore.length > 0) {
      resultnameDay3DaysBefore.forEach((notification) => {
        const indexOfUserId = sendEmailTo.findIndex(
          (user) => user.userId === notification.user_id
        );

        if (indexOfUserId === -1) {
          sendEmailTo.push({
            userId: notification.user_id,
            name_day_3_day_befor: notification.name,
            name_day_today: "",
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          sendEmailTo[
            indexOfUserId
          ].name_day_3_day_befor += `, ${notification.name}`;
        }
      });
    }

    //name day notification today
    const resultnameDayToday = await db.query<RowDataPacket[]>(
      namedayNotificationTodaySql,
      [currentMonth, currentDay]
    );
    if (resultnameDayToday.length > 0) {
      resultnameDayToday.forEach((notification) => {
        const indexOfUserId = sendEmailTo.findIndex(
          (user) => user.userId === notification.user_id
        );

        if (indexOfUserId === -1) {
          sendEmailTo.push({
            userId: notification.user_id,
            name_day_3_day_befor: "",
            name_day_today: notification.name,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          sendEmailTo[indexOfUserId].name_day_today += `, ${notification.name}`;
        }
      });
    }

    //Send email to users
    if (sendEmailTo.length > 0) {
      sendEmailTo.forEach(async (user) => {
        const html = `
          <!DOCTYPE html>
          <html lang="hu">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                .container {
                  width: 90%;
                  margin: 0 auto;
                }
                .bold {
                  font-weight: bold;
                }
                .name {
                  text-align: center;
                }
              </style>
              <title>Name day notification</title>
            </head>
            <body>
              <div class="container">
                <h2 class="name">Tisztelt ${user.last_name}</h2>
                <div class="text">
                  <p>
                    Azért kaptad ezt a levelet mert Azért kaptad ezt a levelet mert az
                    oldalon a következő emlékeztetőket állítottad be:
                  </p>
                  <p><span class="bold">Névnapok a mai napon ${today.toLocaleDateString()} : </span> <span> ${
          user.name_day_today
        }</span></p>
                  <p><span class="bold">Közelgő névnapok ${threeDayBefore.toLocaleDateString()} : </span> <span>${
          user.name_day_3_day_befor
        }</span></p>
                </div>
              </div>
            </body>
          </html>`;
        const email = user.email;

        await transporter.sendMail({
          to: email,
          subject: "Emlékeztető a Name day notification oldalról",
          html: html,
        });
      });
    }

    res.json("Emails sent successful");
  } catch (error) {
    res.json(error);
  }
};
