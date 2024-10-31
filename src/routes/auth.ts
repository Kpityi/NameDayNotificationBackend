import express from "express";
import { confirmEmail, login, signup } from "../controllers/auth";

const router = express.Router();

router.post("/signup", signup);
router.get("/confirmation/:token", confirmEmail);
router.post("/login", login);

export default router;
