import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Actions } from "../../common/constants";
import { isExistingEmail } from "../../services/common.service";
import { TeacherDto } from "../../dto/teacher/teacher.dto";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as subjectService from "../../services/subject.service";
import * as teacherService from "../../services/teacher.service";
import { getSuccessMessage, handleError } from "../../common/utils";
import { TeacherQueryDto } from "../../dto/teacher/teacher-query.dto";
import { TeacherCheckQueryDto } from "../../dto/teacher/teacher-check-query.dto";

const refineDto = (data: any) => {
  const teacherDto = plainToClass(TeacherDto, data);
  teacherDto.subjects = data.subjects.map(Number);
  teacherDto.date_of_birth = new Date(data.date_of_birth);
  teacherDto.gender = +data.gender;
  teacherDto.status = +data.status;
  return teacherDto;
};

const refineQueryDto = (data: any) => {
  const teacherDto = plainToClass(TeacherQueryDto, data);
  teacherDto.semester = +data.semester;
  teacherDto.subject = +data.subject;
  teacherDto.day = +data.day;
  teacherDto.start = +data.start;
  teacherDto.end = +data.end;
  return teacherDto;
};

const refineCheckQueryDto = (data: any) => {
  const teacherDto = plainToClass(TeacherCheckQueryDto, data);
  teacherDto.semester = +data.semester;
  teacherDto.teacher = +data.teacher;
  teacherDto.day = +data.day;
  teacherDto.start = +data.start;
  teacherDto.end = +data.end;
  return teacherDto;
};

export const getTeachers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const teachers = await teacherService.getTeachers();
    const subjects = await subjectService.getSubjects();
    const source = req.query.source?.toString() || "";
    const msg = getSuccessMessage(source, "teacher");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    res.render("teacher/index", {
      user: (req.session as CustomSessionData).user,
      teachers,
      subjects,
      success_msg,
    });
    return;
  }
);

export const getAvailableTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.query };
  const teacherQueryDto = refineQueryDto(data);
  const _errors = await validate(teacherQueryDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req, res) });
  }
  const teachers = await teacherService.getAvailableTeachers(teacherQueryDto);
  return res.json(teachers);
};

export const checkAvailableTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.query };
  const teacherCheckQueryDto = refineCheckQueryDto(data);
  const _errors = await validate(teacherCheckQueryDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req, res) });
  }
  const isAvailable = await teacherService.checkAvailableTeacher(
    teacherCheckQueryDto
  );
  return res.json(isAvailable);
};

export const createTeacher = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.subjects)) {
      req.body.subjects =
        typeof req.body.subjects === "undefined" ? [] : [req.body.subjects];
    }
    next();
  },
  async (req: Request, res: Response, next: NextFunction) => {
    const data = { ...req.body };
    const createTeacherDto = refineDto(data);
    const _errors = await validate(createTeacherDto);
    if (_errors.length > 0) {
      return res.json({ errors: handleError(_errors, req, res) });
    }
    if (await isExistingEmail(data.email)) {
      return res.json({ errors: { email: [req.t("email_existing")] } });
    }
    await teacherService.createTeacher(createTeacherDto);
    return res.redirect("/teachers");
  },
];

export const updateTeacher = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.subjects)) {
      req.body.subjects =
        typeof req.body.subjects === "undefined" ? [] : [req.body.subjects];
    }
    next();
  },
  async (req: Request, res: Response, next: NextFunction) => {
    const data = { ...req.body };
    const updateTeacherDto = refineDto(data);
    const _errors = await validate(updateTeacherDto);
    const id = parseInt(req.params.id);
    if (_errors.length > 0) {
      return res.json({ errors: handleError(_errors, req, res) });
    }
    if (await isExistingEmail(data.email, id)) {
      return res.json({ errors: { email: [req.t("email_existing")] } });
    }
    await teacherService.updateTeacher(id, updateTeacherDto);
    return res.redirect("/teachers");
  },
];

export const deleteTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const deleteResult = await teacherService.deleteTeacher(+id);
  if (typeof deleteResult === "string") {
    const errors = [{ msg: req.t(deleteResult) }];
    const teachers = await teacherService.getTeachers();
    const subjects = await subjectService.getSubjects();
    return res.render("teacher/index", {
      user: (req.session as CustomSessionData).user,
      subjects,
      teachers,
      errors,
    });
  }
  return res.redirect("/teachers?source=" + Actions.DELETE);
};
