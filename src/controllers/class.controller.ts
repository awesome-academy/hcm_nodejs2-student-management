import { CustomSessionData } from "../interfaces/session.interface";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getClasses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("class/index", {user: (req.session as CustomSessionData).user});
    return;
  }
);
