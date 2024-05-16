import * as authService from "../services/auth.service";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { CustomSessionData } from "../interfaces/session.interface";
import { Staff } from "../entities/staff.entity";
import { Teacher } from "../entities/teacher.entity";
import { Student } from "../entities/student.entity";
import { UserLoginDto } from "../dto/auth/login.dto";
import { DEFAULT_SECRET, TOKEN_EXPIRE } from "../common/constants";

export const getLoginPage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.render("auth/login");
    return;
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userLoginDto = plainToClass(UserLoginDto, req.body);
    const _errors = await validate(userLoginDto);
    const data = { ...req.body };
    if (_errors.length > 0) {
      const errors = _errors.map((error) => {
        return { msg: req.t(Object.values(error.constraints!)[0]) };
      });
      return res.render("auth/login", { errors, data });
    }
    const authResult = await authService.validateLogin(
      req.body.username,
      req.body.password
    );
    if (typeof authResult === "string") {
      res.render("auth/login", { errors: [{ msg: req.t(authResult) }], data });
    } else {
      const user = authResult;
      let role;
      let roleKey;
      let redirectTarget;
      switch (true) {
        case user instanceof Staff:
          role = "staff";
          roleKey = "staff"
          redirectTarget = "/classes"
          break;
        case user instanceof Teacher:
          role = "teacher.title";
          roleKey = "teacher"
          redirectTarget = "/classes"
          break;
        case user instanceof Student:
          role = "student.title";
          roleKey = "student"
          redirectTarget = "/classes/my-class"
          break;
        default:
          return;
      }
      (req.session as CustomSessionData).user = {
        id: user.id,
        name: user.name,
        role,
        roleKey
      };
      const token = jwt.sign(
        { userId: user.id, accountId: user.account.id },
        process.env.JWT_SECRET_KEY || DEFAULT_SECRET,
        {
          expiresIn: TOKEN_EXPIRE,
        }
      );

      res.cookie("token", token, { httpOnly: true });
      res.redirect(redirectTarget);
    }
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((err) => {
      if (err) {
        req.flash("error", req.t("logout_fail"));
        res.redirect("/");
      }
    });
    res.clearCookie("token");
    res.redirect("/auth/login");
  }
);
