import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { handleError } from "../../common/utils";
import { UpdateConductDto } from "../../dto/student/update-conduct.dto";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as conductService from "../../services/conduct.service"

const refineDto = (data: any) => {
    const conductDto = plainToClass(UpdateConductDto, data);
    conductDto.class_id = +data.class_id;
    conductDto.semester_id = +data.semester_id;
    conductDto.conduct = +data.conduct;
    return conductDto;
  };

export const updateConductStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const updateConductDto = refineDto(data);
  const _errors = await validate(updateConductDto);
  const id = parseInt(req.params.id);
  
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req, res) });
  }
  const user = (req.session as CustomSessionData).user;
  const updateResult = await conductService.updateConduct(id, updateConductDto, user?.id!);
  if (typeof updateResult === "string") {
    return res.json({ errors: { _class: [req.t(updateResult)] } });
  }
  return res.redirect("/classes/homeroom-class");
};
