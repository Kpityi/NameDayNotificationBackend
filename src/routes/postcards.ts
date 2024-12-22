import express from "express";
import { getPostcards, sendPostcard } from "../controllers/postcards";

const router = express.Router();

router.get("/", getPostcards);
router.post("/", sendPostcard);

export default router;
