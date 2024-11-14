import express from "express";
import { getNotifications } from "../controllers/Notifications";

const router = express();
router.get("/", getNotifications);

export default router;
