import { CustomSessionData } from "../../interfaces/session.interface";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as subjectService from "../../services/subject.service";
import * as gradeService from "../../services/grade.service";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { SubjectDto } from "../../dto/subject/subject.dto";
import { Actions } from "../../common/constants";
import { getSuccessMessage } from "../../common/utils";

export const getSubjects = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const subjects = await subjectService.getSubjects();
    const grades = await gradeService.getGrades();
    const source = req.query.source?.toString() || "";
    const msg = getSuccessMessage(source, "subject");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    res.render("subject/index", {
      user: (req.session as CustomSessionData).user,
      subjects,
      grades,
      success_msg,
    });
    return;
  }
);

export const createSubject = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.grades)) {
      req.body.grades =
        typeof req.body.grades === "undefined" ? [] : [req.body.grades];
    }
    next();
  },
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const createSubjectDto = plainToClass(SubjectDto, req.body);
    const subjects = await subjectService.getSubjects();
    const grades = await gradeService.getGrades();
    const _errors = await validate(createSubjectDto);
    const data = { ...req.body };
    if (_errors.length > 0) {
      const errors = _errors.map((error) => {
        return { msg: req.t(Object.values(error.constraints!)[0]) };
      });
      return res.render("subject/index", {
        user: (req.session as CustomSessionData).user,
        subjects,
        grades,
        errors,
      });
    }
    if (await subjectService.isExistingSubject(data.name)) {
      const errors = [{ msg: req.t("subject.existing") }];
      return res.render("subject/index", {
        user: (req.session as CustomSessionData).user,
        subjects,
        grades,
        errors,
      });
    }
    await subjectService.createSubject(
      data.name,
      data.grades.map((grade: string) => parseInt(grade))
    );
    res.redirect("/subjects?source=" + Actions.CREATE);
  }),
];

export const updateSubject = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.grades)) {
      req.body.grades =
        typeof req.body.grades === "undefined" ? [] : [req.body.grades];
    }
    next();
  },
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const updateSubjectDto = plainToClass(SubjectDto, req.body);
    const subjects = await subjectService.getSubjects();
    const grades = await gradeService.getGrades();
    const _errors = await validate(updateSubjectDto);
    const data = { ...req.body };
    const id = parseInt(req.params.id);
    if (_errors.length > 0) {
      const errors = _errors.map((error) => {
        return { msg: req.t(Object.values(error.constraints!)[0]) };
      });
      return res.render("subject/index", {
        user: (req.session as CustomSessionData).user,
        subjects,
        grades,
        errors,
      });
    }
    if (await subjectService.isExistingSubject(data.name, id)) {
      const errors = [{ msg: req.t("subject.existing") }];
      return res.render("subject/index", {
        user: (req.session as CustomSessionData).user,
        subjects,
        grades,
        errors,
      });
    }
    await subjectService.updateSubject(
      id,
      data.name,
      data.grades.map((grade: string) => parseInt(grade))
    );
    res.redirect("/subjects?source=" + Actions.UPDATE);
  }),
];

export const deleteSubject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const subjects = await subjectService.getSubjects();
    const grades = await gradeService.getGrades();
    const deleteResult = await subjectService.deleteSubject(+id);
    if (typeof deleteResult === "string") {
      const errors = [{ msg: req.t(deleteResult) }];
      return res.render("subject/index", {
        user: (req.session as CustomSessionData).user,
        subjects,
        grades,
        errors,
      });
    }
    res.redirect("/subjects?source=" + Actions.DELETE);
  }
);
