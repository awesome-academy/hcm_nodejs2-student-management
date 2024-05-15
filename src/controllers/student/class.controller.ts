import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as classService from "../../services/class.service";

export const getStudentClass = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sclass } = req.query;
    const user = (req.session as CustomSessionData).user;
    const classes = await classService.getStudentClasses(user?.id!);
    let classDetail = undefined;
    if (classes.length > 0) {
      const classId = sclass ? parseInt(sclass.toString()) : classes[0].id;
      classDetail = await classService.getClassDetail(classId);
    }
    res.render("class/my-class", {
      user,
      classes,
      classDetail,
    });
    return;
  }
);
