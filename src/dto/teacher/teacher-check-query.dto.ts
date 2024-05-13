import {
    IsEnum,
    IsNotEmpty,
    IsNumber
} from "class-validator";
import { Days, Periods } from "../../common/constants";

export class TeacherCheckQueryDto {
  @IsNotEmpty({ message: "schedule.semester_not_empty" })
  @IsNumber({}, {message: "schedule.invalid_semester"})
  semester: number;

  @IsNotEmpty({ message: "schedule.teacher_not_empty" })
  @IsNumber({}, {message: "schedule.invalid_teacher"})
  teacher: number;

  @IsNotEmpty({ message: "schedule.day_not_empty" })
  @IsEnum(Days, { message: "schedule.day_invalid" })
  day: Days;

  @IsNotEmpty({ message: "schedule.start_period_not_empty" })
  @IsEnum(Periods, { message: "schedule.period_invalid" })
  start: Periods;

  @IsNotEmpty({ message: "schedule.end_period_not_empty" })
  @IsEnum(Periods, { message: "schedule.period_invalid" })
  end: Periods;
}
