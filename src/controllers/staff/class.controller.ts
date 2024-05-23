import { CustomSessionData } from "../../interfaces/session.interface";
import * as gradeService from "../../services/grade.service";
import * as teacherService from "../../services/teacher.service";
import * as classService from "../../services/class.service";
import * as studentService from "../../services/student.service";
import * as semesterService from "../../services/semester.service";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import {
  Actions,
  ClassStatus,
  HIGH_GRADES,
  SECONDARY_GRADES,
} from "../../common/constants";
import { getSuccessMessage, handleError } from "../../common/utils";
import { ClassDto } from "../../dto/class/class.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

const refineDto = (data: any) => {
  const classDto = plainToClass(ClassDto, data);
  if (!classDto.school_year) classDto.school_year = new Date().getFullYear();
  else classDto.school_year = +data.school_year;
  if (!classDto.status) classDto.status = ClassStatus.ACTIVE;
  else classDto.status = +data.status;
  classDto.teacher = +data.teacher;
  classDto.grade = +data.grade;
  return classDto;
};

const validateIds = async (
  req: Request
): Promise<string | [number, number[]]> => {
  const classId = +req.params.id;
  const students = req.body.students;
  const studentIds = students.map(Number);
  if (studentIds.includes(NaN)) return "class.student_invalid";
  const nonExistIds = await studentService.isNonExistIds(studentIds);
  if (nonExistIds) return "class.student_not_exist";
  return [classId, studentIds];
};

export const getClasses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { school_year, grade, status, source } = req.query;
    const _source = source?.toString() || "";
    const msg = getSuccessMessage(_source, "class");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    const currentYear = new Date().getFullYear();
    const year = school_year ? parseInt(school_year as string) : currentYear;
    let _grade: number | undefined = parseInt(grade as string);
    if (!SECONDARY_GRADES.includes(_grade) && !HIGH_GRADES.includes(_grade))
      _grade = undefined;
    let _status: number | undefined = parseInt(status as string);
    if (!Object.values(ClassStatus).includes(_status)) _status = undefined;
    const [grades, teachers, classes, school_years] = await Promise.all([
      gradeService.getGrades(),
      teacherService.getNonHomeRoomTeachers(currentYear),
      classService.getClasses(year, _grade, _status),
      semesterService.getDistinctSchoolYears(),
    ]);
    res.render("class/index", {
      user: (req.session as CustomSessionData).user,
      grades,
      teachers,
      classes,
      school_years,
      success_msg,
    });
    return;
  }
);

export const getClassesByGrade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const gradeId = parseInt(req.params.gradeId);
  const year = req.query.year;
  const school_year = year ? parseInt(year.toString()) : undefined;
  let errors;
  if (!gradeId) {
    errors = [{ msg: req.t("grade.invalid") }];
    return res.json({ errors });
  }
  const classes = await classService.getClassesByGrade(gradeId, school_year);
  return res.json(classes);
};

export const getClassDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { source } = req.query;
  const _source = source?.toString() || "";
  const msg = getSuccessMessage(_source, "student");
  const success_msg = msg.length > 0 ? req.t(msg) : undefined;
  const id = +req.params.id;
  const classDetail = id ? await classService.getClassDetail(id) : undefined;
  return res.render("class/class-detail", {
    user: (req.session as CustomSessionData).user,
    classDetail,
    success_msg,
  });
};

export const addStudentToClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validateResult = await validateIds(req);
  if (typeof validateResult === "string") {
    return res.json({ errors: { student: validateResult } });
  } else {
    const classId = validateResult[0];
    const studentIds = validateResult[1];
    const createResult = classId
      ? await classService.addStudentsToClass(studentIds, classId)
      : "class.invalid";
    if (typeof createResult === "string") {
      return res.json({ errors: { student: createResult } });
    }
    return res.redirect(`/classes/${classId}`);
  }
};

export const removeStudentFromClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validateResult = await validateIds(req);
  if (typeof validateResult === "string") {
    return res.json({ errors: { student: validateResult } });
  } else {
    const classId = validateResult[0];
    const studentIds = validateResult[1];
    const deleteResult = classId
      ? await classService.removeStudentsFromClass(studentIds, classId)
      : "class.invalid";
    if (typeof deleteResult === "string") {
      return res.json({ errors: { student: deleteResult } });
    }
    return res.redirect(`/classes/${classId}`);
  }
};

export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const createClassDto = refineDto(data);
  const _errors = await validate(createClassDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  if (await classService.isExistingClass(createClassDto)) {
    return res.json({ errors: { name: [req.t("class.existing")] } });
  }
  const createResult = await classService.createClass(createClassDto);
  if (typeof createResult === "string") {
    return res.json({ errors: { name: [req.t(createResult)] } });
  }
  return res.redirect("/classes");
};

export const updateClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const updateClassDto = refineDto(data);
  const _errors = await validate(updateClassDto);
  const id = +req.params.id;
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  if (await classService.isExistingClass(updateClassDto, id)) {
    return res.json({ errors: { name: [req.t("class.existing")] } });
  }
  const updateResult = await classService.updateClass(id, updateClassDto);
  if (typeof updateResult === "string") {
    return res.json({ errors: { name: [req.t(updateResult)] } });
  }
  return res.redirect("/classes");
};

export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = +req.params.id;
  const deleteResult = await classService.deleteClass(id);
  if (typeof deleteResult === "string") {
    const errors = [{ msg: req.t(deleteResult) }];
    const [grades, teachers, classes, school_years] = await Promise.all([
      gradeService.getGrades(),
      teacherService.getNonHomeRoomTeachers(new Date().getFullYear()),
      classService.getClasses(new Date().getFullYear()),
      semesterService.getDistinctSchoolYears(),
    ]);
    return res.render("class/index", {
      user: (req.session as CustomSessionData).user,
      grades,
      teachers,
      classes,
      school_years,
      errors,
    });
  }
  return res.redirect("/classes?source=" + Actions.DELETE);
};
