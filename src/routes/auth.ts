import express from "express";
import { confirmEmail, signup } from "../controllers/auth";

const router = express.Router();

router.post("/signup", signup);
router.get("/confirmation/:token", confirmEmail);

export default router;
