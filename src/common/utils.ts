import { Request, Response } from "express";
import sgMail from "../config/sendgrid";
import {
  Actions,
  END_MONTH_FS,
  END_MONTH_SS,
  START_MONTH_FS,
  START_MONTH_SS,
  SemesterNames,
} from "./constants";
import { Semester } from "../entities/semester.entity";

export async function sendAccountInfo(
  email: string,
  account: { username: string; password: string }
): Promise<void> {
  sgMail
    .send({
      to: email,
      from: process.env.EMAIL!,
      templateId: process.env.SG_ACCOUNT_INFO_TEMPLATE_ID!,
      dynamicTemplateData: {
        username: account.username,
        password: account.password,
      },
    })
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
}

export function getSuccessMessage(
  source: string,
  i18fieldName: string
): string {
  switch (source) {
    case Actions.CREATE:
      return `${i18fieldName}.create_toast_msg`;
    case Actions.UPDATE:
      return `${i18fieldName}.update_toast_msg`;
    case Actions.DELETE:
      return `${i18fieldName}.delete_toast_msg`;
    default:
      return "";
  }
}

export function handleError(_errors: any[], req: Request) {
  let errors: any = {};
  _errors.map((error) => {
    errors[error.property] = Object.values(error.constraints!).map(
      (error_msg) => req.t(error_msg as string)
    );
  });
  return errors;
}

export function refineSemester(semester: any): number {
  let semesterName = semester ? parseInt(semester.toString()) : undefined;
  if (!semesterName || !Object.values(SemesterNames).includes(semesterName)) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth >= START_MONTH_SS && currentMonth <= END_MONTH_SS)
      semesterName = SemesterNames.SECOND;
    else semesterName = SemesterNames.FIRST;
  }
  return semesterName;
}

export function getSemesterData(semester: Semester) {
  let startMonth, endMonth, year;
  switch (semester.name) {
    case SemesterNames.FIRST:
      startMonth = START_MONTH_FS;
      endMonth = END_MONTH_FS;
      year = +semester.school_year.split("-")[0];
      break;
    case SemesterNames.SECOND:
      startMonth = START_MONTH_SS;
      endMonth = END_MONTH_SS;
      year = +semester.school_year.split("-")[1];
      break;
  }
  return { startMonth, endMonth, year };
}

export function checkSemesterStarted(month: number, year: number): boolean {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  if (currentYear > year) {
    return true;
  } else if (currentYear == year) {
    if (currentMonth >= month) return true;
  }
  return false;
}
