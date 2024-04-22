import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getTeachers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("teacher/index");
    return;
  }
);
