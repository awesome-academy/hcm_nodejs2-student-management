import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { refineSemester } from "../../common/utils";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as teachingService from "../../services/teaching.service";
import * as scheduleService from "../../services/schedule.service";

export const getSchedules = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { semester, year } = req.query;
    const user = (req.session as CustomSessionData).user;
    const teacherId = user?.id!;
    const years = await teachingService.getTeachingYears(teacherId);
    let semesterName = refineSemester(semester);
    let schedule;
    if (years.length > 0) {
      const _year = year
        ? parseInt(year.toString()) + "-" + (parseInt(year.toString()) + 1)
        : years[0];
      if (years.includes(_year)) {
        schedule = await scheduleService.getTeacherSchedules(
          _year,
          semesterName,
          teacherId
        );
      }
    }
    return res.render("schedule/teacher-schedule", {
      user,
      years,
      schedule,
    });
  }
);
