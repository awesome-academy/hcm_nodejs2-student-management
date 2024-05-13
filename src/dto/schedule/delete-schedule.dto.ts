import {
    IsEnum,
    IsNotEmpty
} from "class-validator";
import { Days, Periods } from "../../common/constants";

export class DeleteScheduleDto {
  @IsNotEmpty({ message: "schedule.semester_not_empty" })
  semester: number;

  @IsNotEmpty({ message: "schedule.class_not_empty" })
  _class: number;

  @IsNotEmpty({ message: "schedule.day_not_empty" })
  @IsEnum(Days, { message: "schedule.day_invalid" })
  day: Days;

  @IsNotEmpty({ message: "schedule.start_period_not_empty" })
  @IsEnum(Periods, { message: "schedule.period_invalid" })
  startPeriod: Periods;

  @IsNotEmpty({ message: "schedule.end_period_not_empty" })
  @IsEnum(Periods, { message: "schedule.period_invalid" })
  endPeriod: Periods;
}
