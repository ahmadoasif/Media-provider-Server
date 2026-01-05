import { Request, Response, NextFunction } from "express";
import { unAuthorizedResponse } from "../utils/apiResponses/apiResponses.js";

export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.userId;
    const role = req.user?.role;
    console.log("fdssfd", id, role);

    if (!id) {
      return unAuthorizedResponse(res, "User ID missing in request", null);
    }

    if (!role) {
      return unAuthorizedResponse(res, "User role missing in token", null);
    }

    if (!allowedRoles.includes(role)) {
      console.log("request did not passed role test")
      return unAuthorizedResponse(res, "Access denied", {
        "User role": role,
        "Allowed roles": allowedRoles,
      });
    }

    next();
  };
};
