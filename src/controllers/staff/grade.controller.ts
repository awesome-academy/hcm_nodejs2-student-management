import { getSuccessMessage } from "../../common/utils";
import {
  Actions,
  EducationLevels,
  HIGH_GRADES,
  SECONDARY_GRADES,
} from "../../common/constants";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as gradeService from "../../services/grade.service";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const getGrades = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const grades = await gradeService.getGrades();
    const source = req.query.source?.toString() || "";
    const msg = getSuccessMessage(source, "grade");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    res.render("grade/index", {
      user: (req.session as CustomSessionData).user,
      grades,
      success_msg,
    });
    return;
  }
);

export const updateGrades = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.level)) {
      req.body.level =
        typeof req.body.level === "undefined" ? [] : [req.body.level];
    }
    next();
  },
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const levels = req.body.level;
    const errors = [];
    if (levels.includes(EducationLevels.SECONDARY.toString()))
      await gradeService.createGrades(SECONDARY_GRADES);
    else {
      const deleteResult = await gradeService.deleteGrades(SECONDARY_GRADES);
      if (typeof deleteResult === "boolean") {
        errors.push({ msg: req.t("grade.sclass_delete_required") });
      }
    }
    if (levels.includes(EducationLevels.HIGH.toString()))
      await gradeService.createGrades(HIGH_GRADES);
    else {
      const deleteResult = await gradeService.deleteGrades(HIGH_GRADES);
      if (typeof deleteResult === "boolean") {
        errors.push({ msg: req.t("grade.hclass_delete_required") });
      }
    }
    if (errors.length > 0) {
      return res.render("grade/index", {
        errors,
        user: (req.session as CustomSessionData).user,
        grades: await gradeService.getGrades(),
      });
    }
    res.redirect("/grades?source=" + Actions.UPDATE);
  }),
];
