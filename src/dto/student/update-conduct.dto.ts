import { IsEnum, IsNotEmpty } from "class-validator";
import { ConductTypes } from "../../common/constants";

export class UpdateConductDto {
  @IsEnum(ConductTypes, { message: "student.conduct_invalid" })
  conduct: ConductTypes;

  @IsNotEmpty({ message: "student.semester_not_empty" })
  semester_id: number;

  @IsNotEmpty({ message: "student.class_not_empty" })
  class_id: number;
}
