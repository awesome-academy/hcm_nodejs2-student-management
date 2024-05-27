import {
    IsEnum,
    IsNotEmpty,
    Max,
    Min
} from "class-validator";
import { MAX_SCORE, MIN_SCORE, ScoreFactors } from "../../common/constants";

export class CreateScoreDto {
  @IsNotEmpty({ message: "score.student_not_empty" })
  student_score: number;

  @IsEnum(ScoreFactors, { message: "score.factor_invalid" })
  factor: ScoreFactors;

  @Min(MIN_SCORE, { message: "score.invalid_value" })
  @Max(MAX_SCORE, { message: "score.invalid_value" })
  score: number;
}
