import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getSubjects = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("subject/index");
    return;
  }
);
