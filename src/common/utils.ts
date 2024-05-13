import { Request, Response } from "express";
import sgMail from "../config/sendgrid";
import { Actions } from "./constants";

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

export function handleError(_errors: any[], req: Request, res: Response) {
  let errors: any = {};
  _errors.map((error) => {
    errors[error.property] = Object.values(error.constraints!).map(
      (error_msg) => req.t(error_msg as string)
    );
  });
  return errors;
}
