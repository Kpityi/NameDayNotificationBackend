import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/environment";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import transporter from "../config/nodemailer";
import {
  sqlAddNameday,
  sqlDeleteNameDay,
  sqlNamedayNotification3DayBefore,
  sqlNamedayNotificationToday,
  sqlNamedays,
} from "../sql/nameDay";
import {
  sqlAddOccasion,
  sqlDeleteOccasion,
  sqlOccasionNotification3DayBefore,
  SqloccasionNotificationToday,
  sqlOccasions,
} from "../sql/occasion";
import {
  sqlAddCustom,
  sqlCustom,
  SqlcustomNotification3DayBefore,
  sqlCustomNotificationToday,
  sqlDeleteCustom,
} from "../sql/custom";

interface NotificationsProps {
  nameDays: object;
  occasions: object;
  custom: object;
}
interface SendEmailToProps {
  userId: number;
  name_day_today?: string;
  name_day_3_day_before?: string;
  occasion?: string;
  custom?: string;
  email: string;
  last_name: string;
}

//Get all notifications
export const getNotifications = async (req: Request, res: Response) => {
  const token = jwt.verify(req.cookies?.token, JWT_SECRET) as {
    userId: string;
  };

  const userId: string = token.userId;
  const notifications: NotificationsProps = {
    nameDays: [],
    occasions: [],
    custom: [],
  };

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

//Delete notification --Name day--
export const deleteNameDayNotificaction = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await db.query<ResultSetHeader>(sqlDeleteNameDay, [id]);
    if (result.affectedRows) {
      res.status(200).json({ message: "Értesítés törlése sikeres!" });
    }
  } catch (error) {
    res.status(409).jsonp(error);
  }
};

//Delete notification --Occasion--
export const deleteOccasionNotificaction = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await db.query<ResultSetHeader>(sqlDeleteOccasion, [id]);
    if (result.affectedRows) {
      res.status(200).json({ message: "Értesítés törlése sikeres!" });
    }
  } catch (error) {
    res.status(409).jsonp(error);
  }
};

//Delete notification --Custom--
export const deleteCustomNotificaction = async (
  req: Request,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await db.query<ResultSetHeader>(sqlDeleteCustom, [id]);
    if (result.affectedRows) {
      res.status(200).json({ message: "Értesítés törlése sikeres!" });
    }
  } catch (error) {
    res.status(409).jsonp(error);
  }
};

//Add notification --Name day--
export const addNameDayNotification = async (req: Request, res: Response) => {
  const id = req.params.id;

  const token = jwt.verify(req.cookies?.token, JWT_SECRET) as {
    userId: string;
  };
  const userId: string = token.userId;

  try {
    const result = await db.query<ResultSetHeader>(sqlAddNameday, [userId, id]);
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

//Add notification --Occasion--
export const addOccasionNotification = async (req: Request, res: Response) => {
  const { month, day, occasion } = req.body;

  const token = jwt.verify(req.cookies?.token, JWT_SECRET) as {
    userId: string;
  };
  const userId: string = token.userId;

  try {
    const result = await db.query<ResultSetHeader>(sqlAddOccasion, [
      userId,
      month,
      day,
      occasion,
    ]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Emlékeztető hozááadása sikeres!" });
    }
  } catch (error) {
    res.status(409).json({
      message: "Emlékeztető hozzáadása sikertelen, kérjük próbálkozzon később!",
    });
  }
};

//Add notification --Custom--
export const addCustomNotification = async (req: Request, res: Response) => {
  const { year, month, day, text } = req.body;
  const date = `${year}-${month}-${day}`;

  const token = jwt.verify(req.cookies?.token, JWT_SECRET) as {
    userId: string;
  };
  const userId: string = token.userId;

  try {
    const result = await db.query<ResultSetHeader>(sqlAddCustom, [
      userId,
      date,
      text,
    ]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Emlékeztető hozááadása sikeres!" });
    }
  } catch (error) {
    res.status(409).json({
      message: "Emlékeztető hozzáadása sikertelen, kérjük próbálkozzon később!",
    });
  }
};

export const sendNotificationEmail = async (req: Request, res: Response) => {
  const dayInMilisecond = 1000 * 60 * 60 * 24;
  const today = new Date();
  const threeDayBefore = new Date(Number(today) + dayInMilisecond * 3);
  const date = today.toISOString().split("T")[0];
  const dateThreeDayBefore = threeDayBefore.toISOString().split("T")[0];
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const threeDayBeforeMonth = threeDayBefore.getMonth() + 1;
  const threeDayBeforeDay = threeDayBefore.getDate();
  const sendEmailTo: SendEmailToProps[] = [];

  try {
    //name day notification 3 days earlier
    const resultnameDay3DaysBefore = await db.query<RowDataPacket[]>(
      sqlNamedayNotification3DayBefore,
      [threeDayBeforeMonth, threeDayBeforeDay]
    );
    if (resultnameDay3DaysBefore.length > 0) {
      resultnameDay3DaysBefore.forEach((notification) => {
        const user = sendEmailTo.find(
          (user) => user.userId === notification.user_id
        );

        if (!user) {
          sendEmailTo.push({
            userId: notification.user_id,
            name_day_3_day_before: notification.name,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          if (user.name_day_3_day_before == undefined) {
            user.name_day_3_day_before = `${notification.name}`;
          } else {
            user.name_day_3_day_before += `, ${notification.name}`;
          }
        }
      });
    }

    //name day notification today
    const resultnameDayToday = await db.query<RowDataPacket[]>(
      sqlNamedayNotificationToday,
      [currentMonth, currentDay]
    );
    if (resultnameDayToday.length > 0) {
      resultnameDayToday.forEach((notification) => {
        const user = sendEmailTo.find(
          (user) => user.userId === notification.user_id
        );

        if (!user) {
          sendEmailTo.push({
            userId: notification.user_id,
            name_day_today: notification.name,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          if (user.name_day_today == undefined) {
            user.name_day_today = `${notification.name}`;
          } else {
            user.name_day_today += `, ${notification.name}`;
          }
        }
      });
    }

    //occasion notification 3 days earlier
    const resultOccasion3DaysBefore = await db.query<RowDataPacket[]>(
      sqlOccasionNotification3DayBefore,
      [threeDayBeforeMonth, threeDayBeforeDay]
    );

    if (resultOccasion3DaysBefore.length > 0) {
      resultOccasion3DaysBefore.forEach((notification) => {
        const user = sendEmailTo.find(
          (user) => user.userId === notification.user_id
        );

        if (!user) {
          sendEmailTo.push({
            userId: notification.user_id,
            occasion: `${threeDayBeforeMonth}.${threeDayBeforeDay}. ${notification.occasion}`,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          if (user.occasion == undefined) {
            user.occasion = `${threeDayBeforeMonth}.${threeDayBeforeDay}. ${notification.occasion}`;
          } else {
            user.occasion += `, ${threeDayBeforeMonth}.${threeDayBeforeDay}. ${notification.occasion}`;
          }
        }
      });
    }

    //occasion notification today
    const resultOccasionToday = await db.query<RowDataPacket[]>(
      SqloccasionNotificationToday,
      [currentMonth, currentDay]
    );
    if (resultOccasionToday.length > 0) {
      resultOccasionToday.forEach((notification) => {
        const user = sendEmailTo.find(
          (user) => user.userId === notification.user_id
        );

        if (!user) {
          sendEmailTo.push({
            userId: notification.user_id,
            occasion: `${currentMonth}.${currentDay}. ${notification.occasion}`,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          if (user.occasion == undefined) {
            user.occasion = `${currentMonth}.${currentDay}. ${notification.occasion}`;
          } else {
            user.occasion += `, ${currentMonth}.${currentDay}. ${notification.occasion}`;
          }
        }
      });
    }

    //custom notification 3 days earlier
    const resultCustom3DaysBefore = await db.query<RowDataPacket[]>(
      SqlcustomNotification3DayBefore,
      [dateThreeDayBefore]
    );
    if (resultCustom3DaysBefore.length > 0) {
      resultCustom3DaysBefore.forEach((notification) => {
        const user = sendEmailTo.find(
          (user) => user.userId === notification.user_id
        );

        if (!user) {
          sendEmailTo.push({
            userId: notification.user_id,
            custom: `${dateThreeDayBefore}. ${notification.occasion}`,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          if (user.custom == undefined) {
            user.custom = `${dateThreeDayBefore}. ${notification.text}`;
          } else {
            user.custom += `, ${dateThreeDayBefore}. ${notification.text}`;
          }
        }
      });
    }

    //custom notification today
    const resultCustomToday = await db.query<RowDataPacket[]>(
      sqlCustomNotificationToday,
      [date]
    );
    if (resultCustomToday.length > 0) {
      resultCustomToday.forEach((notification) => {
        const user = sendEmailTo.find(
          (user) => user.userId === notification.user_id
        );

        if (!user) {
          sendEmailTo.push({
            userId: notification.user_id,
            custom: `${date}. ${notification.text}`,
            email: notification.email,
            last_name: notification.last_name,
          });
        } else {
          if (user.custom == undefined) {
            user.custom = `${date}. ${notification.text}`;
          } else {
            user.custom += `, ${date}. ${notification.text}`;
          }
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
                .none{
                  heiht: 0;
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
      ${
        user.name_day_today
          ? `
        
        <p><span class="bold">Névnapok a mai napon ${today.toLocaleDateString()} : </span> <span> ${
              user.name_day_today
            }</span></p>
        `
          : `<span class="none"></span>`
      }
      ${
        user.name_day_3_day_before
          ? `
        <p><span class="bold">Közelgő névnapok ${threeDayBefore.toLocaleDateString()} : </span> <span>${
              user.name_day_3_day_before
            }</span></p>
        `
          : `<span class="none"></span>`
      }
      ${
        user.occasion
          ? `
        <p><span class="bold">Fontos alkalmak:</span> <span>${user.occasion}</span> </p>
        `
          : `<span class="none"></span>`
      }
      ${
        user.custom
          ? `
        <p><span class="bold">Egyedi emlékeztetők:</span>  <span>${user.custom}<span> </p>
        
        `
          : `<span class="none"></span>`
      }
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

    res.json(sendEmailTo);
  } catch (error) {
    res.json(error);
  }
};
