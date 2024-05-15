import { DEFAULT_SECRET } from "../common/constants";
import { NextFunction, Request, Response } from "express";
import { CustomSessionData } from "../interfaces/session.interface";
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || DEFAULT_SECRET
    );
    if (!decoded) return res.redirect("/auth/login");
    else return next();
  } catch (error) {
    res.redirect("/auth/login");
  }
};

const checkRole = (
  role: string,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.session &&
      (req.session as CustomSessionData).user?.role === req.t(role)
    ) {
      next();
    } else {
      res.redirect("/auth/login");
    }
  } catch (error) {
    res.redirect("/auth/login");
  }
};

export const isStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  checkRole("staff", req, res, next)
};

export const isTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => { 
  checkRole("teacher.title", req, res, next)
};

export const isStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  checkRole("student.title", req, res, next)
};
