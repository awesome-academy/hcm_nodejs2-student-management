import { CustomSessionData } from "../../interfaces/session.interface";
import { Request, Response, NextFunction } from "express";
import * as semesterService from "../../services/semester.service";
import * as gradeService from "../../services/grade.service";
import * as scheduleService from "../../services/schedule.service";
import * as subjectService from "../../services/subject.service";
import asyncHandler from "express-async-handler";
import { SemesterNames } from "../../common/constants";
import { getSuccessMessage, handleError } from "../../common/utils";
import { plainToClass } from "class-transformer";
import { CreateScheduleDto } from "../../dto/schedule/create-schedule.dto";
import { validate } from "class-validator";
import { DeleteScheduleDto } from "../../dto/schedule/delete-schedule.dto";
import { UpdateScheduleDto } from "../../dto/schedule/update-schedule.dto";

const refineDeleteDto = (data: any) => {
  const scheduleDto = plainToClass(DeleteScheduleDto, data);
  scheduleDto.semester = +data.semester;
  scheduleDto._class = +data._class;
  scheduleDto.day = +data.day;
  scheduleDto.startPeriod = +data.startPeriod;
  scheduleDto.endPeriod = +data.endPeriod;
  return scheduleDto;
};

const refineCreateDto = (data: any) => {
  const scheduleDto = plainToClass(CreateScheduleDto, data);
  const { subject, teacher, ...deleteDto } = { ...scheduleDto };
  const refinedDeleteDto = refineDeleteDto(deleteDto);
  scheduleDto.subject = +data.subject;
  scheduleDto.teacher = +data.teacher;
  return {
    subject: +data.subject,
    teacher: +data.teacher,
    ...refinedDeleteDto,
  };
};

const refineUpdateDto = (data: any) => {
  const scheduleDto = plainToClass(UpdateScheduleDto, data);
  const { oldEndPeriod, ...createDto } = { ...scheduleDto };
  const refinedCreateDto = refineCreateDto(createDto);
  return { oldEndPeriod: +data.oldEndPeriod, ...refinedCreateDto };
};

export const getSchedules = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { semester, sclass, grade, source } = req.query;
    const _grade = grade ? grade.toString() : "";
    const [grades, school_years, subjects] = await Promise.all([
      gradeService.getGrades(),
      semesterService.getDistinctSchoolYears(),
      subjectService.getSubjectsByGrade(parseInt(_grade)),
    ]);
    const _semester = semester
      ? parseInt(semester.toString())
      : SemesterNames.FIRST;
    const classId = sclass ? parseInt(sclass.toString()) : undefined;
    if (!classId) {
      return res.render("schedule/index", {
        user: (req.session as CustomSessionData).user,
        school_years,
        grades,
      });
    }
    const scheduleResult = await scheduleService.getSchedules(
      classId,
      _semester
    );
    if (typeof scheduleResult === "string") {
      const errors = [{ msg: req.t(scheduleResult) }];
      return res.render("schedule/index", {
        user: (req.session as CustomSessionData).user,
        school_years,
        grades,
        errors,
      });
    }
    const _source = source?.toString() || "";
    const msg = getSuccessMessage(_source, "schedule");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    return res.render("schedule/index", {
      user: (req.session as CustomSessionData).user,
      school_years,
      grades,
      subjects,
      schedule: scheduleResult,
      success_msg,
    });
  }
);

export const createSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const scheduleDto = refineCreateDto(data);
  const _errors = await validate(scheduleDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  const createResult = await scheduleService.createSchedule(scheduleDto);
  if (typeof createResult === "string") {
    return res.json({ errors: { teacher: [req.t(createResult)] } });
  }
  return res.redirect("/schedules");
};

export const updateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const scheduleDto = refineUpdateDto(data);
  scheduleDto;
  const _errors = await validate(scheduleDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  const updateResult = await scheduleService.updateSchedule(scheduleDto);
  if (typeof updateResult === "string") {
    return res.json({ errors: { teacher: [req.t(updateResult)] } });
  }
  return res.redirect("/schedules");
};

export const deleteSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const scheduleDto = refineDeleteDto(data);
  const _errors = await validate(scheduleDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  const deleteResult = await scheduleService.deleteSchedule(scheduleDto);
  if (typeof deleteResult === "string") {
    return res.json({ errors: [{ msg: req.t(deleteResult) }] });
  }
  return res.redirect("/schedules");
};
