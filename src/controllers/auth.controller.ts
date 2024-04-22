import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getLoginPage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("auth/login");
    return;
  }
);
