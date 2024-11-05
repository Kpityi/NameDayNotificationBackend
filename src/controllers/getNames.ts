import { Request, Response } from "express";
import db from "../config/db";
export const getNamedays = async (req: Request, res: Response) => {
  const { day, month } = req.body;

  const sql = "SELECT name FROM name_days WHERE day=? AND month=?; ";
  const names: string[] = [];
  try {
    const response = await db.query(sql, [day, month]);
    (response as any[]).forEach((x) => {
      names.push(x.name);
    });

    res.status(200).json(names);
  } catch (error) {
    res.status(401).json(error);
  }
};
