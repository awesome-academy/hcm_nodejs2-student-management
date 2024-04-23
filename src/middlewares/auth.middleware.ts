import { DEFAULT_SECRET } from "../common/constants";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string = req.cookies.token;
    if (!token) {
      return res.redirect("/auth/login");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || DEFAULT_SECRET);
    if (!decoded) return res.redirect("/auth/login");
    else return next();
  } catch (error) {
    res.redirect("/auth/login");
  }
};
