import { IsEnum, IsNotEmpty } from "class-validator";
import { CreateScheduleDto } from "./create-schedule.dto";
import { Periods } from "../../common/constants";

export class UpdateScheduleDto extends CreateScheduleDto {
  @IsNotEmpty({ message: "schedule.end_period_not_empty" })
  @IsEnum(Periods, { message: "schedule.period_invalid" })
  oldEndPeriod: Periods;
}
