import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { unAuthorizedResponse } from "../utils/apiResponses/apiResponses.js";

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unAuthorizedResponse(res, "Token was not provided", null);
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment variables.");
      return unAuthorizedResponse(res, "Internal configuration error", null);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      console.log("decoded:", decoded)
      next();
    } catch (err) {
      return unAuthorizedResponse(res, "Invalid or expired token", err);
    }
  };
};
