import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
    refineSemester
} from "../../common/utils";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as classService from "../../services/class.service";
import * as scoreService from "../../services/score.service";

export const getScoreboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { semester, sclass } = req.query;
    const user = (req.session as CustomSessionData).user;
    const classes = await classService.getStudentClasses(user?.id!);
    let semesterName = refineSemester(semester);
    if (classes.length > 0) {
      const classId = sclass ? parseInt(sclass.toString()) : classes[0].id;
      const isValidClassId = classes.some((_class) => _class.id === classId);
      if (!isValidClassId) {
        const errors = [{ msg: req.t("scoreboard.unauthorized") }];
        return res.render("scoreboard/student-scoreboard", {
          user,
          classes,
          errors,
        });
      } else {
        const scoreboardResult = await scoreService.getStudentScoreboard(
          classId,
          semesterName,
          user?.id!
        );
        if (typeof scoreboardResult === "string") {
          const errors = [{ msg: req.t(scoreboardResult) }];
          return res.render("scoreboard/student-scoreboard", {
            user,
            classes,
            errors,
          });
        }
        return res.render("scoreboard/student-scoreboard", {
          user,
          classes,
          conduct: scoreboardResult[0],
          scoreboard: scoreboardResult[1],
        });
      }
    }
  }
);
