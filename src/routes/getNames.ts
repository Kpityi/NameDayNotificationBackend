import express from "express";
import { getNamedays } from "../controllers/getNames";

const router = express.Router();

router.post("/", getNamedays);

export default router;
