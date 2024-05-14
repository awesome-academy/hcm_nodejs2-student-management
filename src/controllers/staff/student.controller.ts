import { CustomSessionData } from "../../interfaces/session.interface";
import { Request, Response, NextFunction } from "express";
import * as gradeService from "../../services/grade.service";
import * as studentService from "../../services/student.service";
import asyncHandler from "express-async-handler";
import { plainToClass } from "class-transformer";
import { StudentDto } from "../../dto/student/student.dto";
import { validate } from "class-validator";
import { isExistingEmail } from "../../services/common.service";
import { getSuccessMessage, handleError } from "../../common/utils";
import { Actions } from "../../common/constants";

const refineDto = (data: any) => {
  const studentDto = plainToClass(StudentDto, data);
  studentDto.date_of_birth = new Date(data.date_of_birth);
  studentDto.gender = +data.gender;
  studentDto.status = +data.status;
  studentDto.grade = +data.grade;
  return studentDto;
};

export const getStudents = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const grades = await gradeService.getGrades();
    const students = await studentService.getStudents();
    const source = req.query.source?.toString() || "";
    const msg = getSuccessMessage(source, "student");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    res.render("student/index", {
      user: (req.session as CustomSessionData).user,
      grades,
      students,
      success_msg,
    });
    return;
  }
);

export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const createStudentDto = refineDto(data);
  const _errors = await validate(createStudentDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req, res) });
  }
  if (await isExistingEmail(data.email)) {
    return res.json({ errors : { email: [req.t("email_existing")] }});
  }
  const createResult = await studentService.createStudent(createStudentDto);
  if (typeof createResult === "string") {
    return res.json({ errors: { _class: [req.t(createResult)] } });
  }
  return res.redirect("/students");
};

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const updateStudentDto = refineDto(data);
  const _errors = await validate(updateStudentDto);
  const id = parseInt(req.params.id);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req, res) });
  }
  if (await isExistingEmail(data.email, id)) {
    return res.json({ errors: { email: [req.t("email_existing")] } });
  }
  await studentService.updateStudent(id, updateStudentDto);
  return res.redirect("/students");
};

export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const deleteResult = await studentService.deleteStudent(+id);
  if (typeof deleteResult === "string") {
    const errors = [{ msg: req.t(deleteResult) }];
    const grades = await gradeService.getGrades();
    const students = await studentService.getStudents();
    return res.render("student/index", {
      user: (req.session as CustomSessionData).user,
      grades,
      students,
      errors,
    });
  }
  return res.redirect("/students?source=" + Actions.DELETE);
};
