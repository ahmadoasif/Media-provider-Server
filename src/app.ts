import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import cors from "cors";
import { Request, Response } from "express";
// import './config/passport.js'

const app = express();
// const authorizedOrigins = process.env.CORS_ORIGIN_URL;
// console.log(authorizedOrigins)
// Cors
app.use(cors({
    origin: ["http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://hotel-booking-platform-lyart.vercel.app"],
    // origin: [authorizedOrigins as string],
    credentials: true
}));

app.use((req: Request, res: Response, next) =>
{
    console.log(
        `Request Received: ${new Date().toISOString()} - ${req.method} ${req.url}`
    );
    next();
});

// Body Parser
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Middleware
app.use("/api", routes);

export const startServer = async () => {
    await connectDB();
};

export default app;
