import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { CustomSessionData } from "../../interfaces/session.interface";
import * as scoreService from "../../services/score.service";
import * as teachingService from "../../services/teaching.service";
import { CreateScoreDto } from "../../dto/score/create-score.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { getSuccessMessage, handleError } from "../../common/utils";
import { UpdateScoreDto } from "../../dto/score/update-score.dto";

const refineCreateDto = (data: any) => {
  const scoreDto = plainToClass(CreateScoreDto, data);
  scoreDto.student_score = +data.student_score;
  scoreDto.factor = +data.factor;
  scoreDto.score = +data.score;
  return scoreDto;
};

const refineUpdateDto = (data: any) => {
  const scoreDto = plainToClass(UpdateScoreDto, data);
  scoreDto.score = +data.score;
  return scoreDto;
};

export const getScoreboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const source = req.query.source?.toString() || "";
    const msg = getSuccessMessage(source, "score");
    const success_msg = msg.length > 0 ? req.t(msg) : undefined;
    const teachingId = +req.params.id;
    const user = (req.session as CustomSessionData).user;
    const userId = user?.id!;
    let scoreboard;
    const existingTeaching = teachingId
      ? await teachingService.getTeachingById(teachingId)
      : undefined;
    if (existingTeaching && +existingTeaching.teacher === userId) {
      const { class_school, subject, semester } = { ...existingTeaching };
      scoreboard = await scoreService.getClassScoreDetail(
        class_school,
        subject,
        semester
      );
    }
    return res.render("scoreboard/index", {
      user,
      scoreboard,
      success_msg,
    });
  }
);

export const createScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const scoreDto = refineCreateDto(data);
  const _errors = await validate(scoreDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  const createResult = await scoreService.createScore(scoreDto);
  if (typeof createResult === "string") {
    return res.json({ errors: { score: [req.t(createResult)] } });
  }
  return res.redirect("/classes/teachings");
};

export const updateScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body };
  const scoreDto = refineUpdateDto(data);
  const _errors = await validate(scoreDto);
  if (_errors.length > 0) {
    return res.json({ errors: handleError(_errors, req) });
  }
  const scoreId = +req.params.id;
  const updateResult = scoreId
    ? await scoreService.updateScore(scoreId, scoreDto)
    : "score.invalid_id";
  if (typeof updateResult === "string") {
    return res.json({ errors: { score: [req.t(updateResult)] } });
  }
  return res.redirect("/classes/teachings");
};
