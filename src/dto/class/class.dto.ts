import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional
} from "class-validator";
import { ClassStatus } from "../../common/constants";

export class ClassDto {
  @IsNotEmpty({ message: "classname.not_empty" })
  name: string;

  @IsNotEmpty({ message: "class.school_year_not_empty" })
  @IsNumber({}, {message: "class.school_year_invalid"})
  school_year: number;

  @IsEnum(ClassStatus, { message: "class.status_invalid" })
  status: ClassStatus;

  @IsNotEmpty({ message: "class.teacher_not_empty" })
  teacher: number;

  @IsNotEmpty({ message: "class.grade_not_empty" })
  grade: number;
}
