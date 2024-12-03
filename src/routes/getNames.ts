import express from "express";
import { getNamedays, getNamesOfDay } from "../controllers/getNames";

const router = express.Router();

router.post("/", getNamesOfDay);
router.post("/name", getNamedays);

export default router;
