import express from "express";
import {
  addCustomNotification,
  addNameDayNotification,
  addOccasionNotification,
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
router.post("/add/occasion", addOccasionNotification);
router.post("/add/custom", addCustomNotification);

export default router;
