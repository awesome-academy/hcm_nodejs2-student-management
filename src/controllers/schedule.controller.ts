import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getSchedules = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("schedule/index");
    return;
  }
);
