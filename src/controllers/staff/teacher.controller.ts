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
import { getSuccessMessage } from "../../common/utils";

const refineDto = (data: any) => {
  const teacherDto = plainToClass(TeacherDto, data);
  teacherDto.subjects = data.subjects.map(Number);
  teacherDto.date_of_birth = new Date(data.date_of_birth);
  teacherDto.gender = +data.gender;
  teacherDto.status = +data.status;
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
    let errors: any = {};
    if (_errors.length > 0) {
      _errors.map((error) => {
        errors[error.property] = Object.values(error.constraints!).map(
          (error_msg) => req.t(error_msg)
        );
      });
      return res.json({ errors });
    }
    if (await isExistingEmail(data.email)) {
      errors = { email: [req.t("email_existing")] };
      return res.json({ errors });
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
    let errors: any = {};
    if (_errors.length > 0) {
      _errors.map((error) => {
        errors[error.property] = Object.values(error.constraints!).map(
          (error_msg) => req.t(error_msg)
        );
      });
      return res.json({ errors });
    }
    if (await isExistingEmail(data.email, id)) {
      errors = { email: [req.t("email_existing")] };
      return res.json({ errors });
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
