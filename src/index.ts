import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import { FRONTEND_URL, PORT } from "./config/environment";
import authRutes from "./routes/auth";

const app = express();
app.use(
  cors({
    origin: FRONTEND_URL, // Specifies which domains are allowed
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // If you want to send credentials (e.g., cookies)
  })
);

app.use(cookieParser());

// Apply the rate limiting middleware to all requests.
app.use(express.static("public"));

app.use(express.json());

app.use("/api/auth", authRutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
