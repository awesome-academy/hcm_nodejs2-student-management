import { Max, Min } from "class-validator";
import { MAX_SCORE, MIN_SCORE } from "../../common/constants";

export class UpdateScoreDto {
  @Min(MIN_SCORE, { message: "score.invalid_value" })
  @Max(MAX_SCORE, { message: "score.invalid_value" })
  score: number;
}
