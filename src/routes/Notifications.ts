import express from "express";
import {
  addNameDayNotification,
  deleteCustomNotificaction,
  deleteNameDayNotificaction,
  deleteOccasionNotificaction,
  getNotifications,
  sendNotificationEmail,
} from "../controllers/Notifications";

const router = express();
router.get("/", getNotifications);
router.get("/send", sendNotificationEmail);
router.delete("/namedays/:id", deleteNameDayNotificaction);
router.delete("/occasions/:id", deleteOccasionNotificaction);
router.delete("/customs/:id", deleteCustomNotificaction);
router.post("/add/nameday/:id", addNameDayNotification);

export default router;
