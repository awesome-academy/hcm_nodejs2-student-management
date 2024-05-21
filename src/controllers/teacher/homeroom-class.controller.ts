import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getSuccessMessage, refineSemester } from "../../common/utils";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as classService from "../../services/class.service";
import * as semesterService from "../../services/semester.service";

export const getHomeRoomClass = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { year, semester, source } = req.query;
    const user = (req.session as CustomSessionData).user;
    const userId = user?.id!;
    const _source = source?.toString() || "";
    const msg = getSuccessMessage(_source, "conduct");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    let semesterName = refineSemester(semester);
    let _year = year ? parseInt(year.toString()) : undefined;
    const school_years = await classService.getHomeRoomSchoolYears(userId);
    let classId, classDetail;
    if (!_year) {
      const teacherClasses = await classService.getHomeRoomClasses(userId);
      classId = teacherClasses[0].id;
      _year = +teacherClasses[0].school_year.split("-")[0];
      classDetail = await classService.getHomeRoomClassData(
        classId,
        semesterName,
        userId
      );
    } else {
      const _class = await classService.getHomeRoomClassByYear(_year, userId);
      if (_class) {
        classDetail = await classService.getHomeRoomClassData(
          _class.id,
          semesterName,
          userId
        );
      }
    }
    const school_year = _year + "-" + (_year + 1);
    const _semester = await semesterService.getSemesterByData(semesterName, school_year);
    return res.render("class/homeroom-class", {
      user,
      semester: semesterName,
      semesterId: _semester?.id,
      year: _year,
      school_years,
      classDetail,
      success_msg
    });
  }
);
