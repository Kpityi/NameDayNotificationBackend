import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/environment";
import db from "../config/db";

interface NotificationsProps {
  nameDays: object;
  occasions: object;
  custom: object;
}

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
