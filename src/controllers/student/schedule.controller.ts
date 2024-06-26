import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { refineSemester } from "../../common/utils";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as classService from "../../services/class.service";
import * as scheduleService from "../../services/schedule.service";

export const getSchedules = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { semester, sclass } = req.query;
    const user = (req.session as CustomSessionData).user;
    const classes = await classService.getStudentClasses(user?.id!);
    let semesterName = refineSemester(semester);
    if (classes.length > 0) {
      const classId = sclass ? parseInt(sclass.toString()) : classes[0].id;
      const isValidClassId = classes.some((_class) => _class.id === classId);
      if (!isValidClassId) {
        const errors = [{ msg: req.t("schedule.unauthorized") }];
        return res.render("schedule/student-schedule", {
          user,
          classes,
          errors,
        });
      } else {
        const scheduleResult = await scheduleService.getSchedules(
          classId,
          semesterName
        );
        if (typeof scheduleResult === "string") {
          const errors = [{ msg: req.t(scheduleResult) }];
          return res.render("schedule/student-schedule", {
            user,
            classes,
            schedule: scheduleResult,
            errors,
          });
        }
        return res.render("schedule/student-schedule", {
          user,
          classes,
          schedule: scheduleResult,
        });
      }
    }
  }
);
