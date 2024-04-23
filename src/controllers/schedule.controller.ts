import { CustomSessionData } from "../interfaces/session.interface";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getSchedules = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("schedule/index", {user: (req.session as CustomSessionData).user});
    return;
  }
);
