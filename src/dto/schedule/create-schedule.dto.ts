import { IsNotEmpty } from "class-validator";
import { DeleteScheduleDto } from "./delete-schedule.dto";

export class CreateScheduleDto extends DeleteScheduleDto {
  @IsNotEmpty({ message: "schedule.subject_not_empty" })
  subject: number;

  @IsNotEmpty({ message: "schedule.teacher_not_empty" })
  teacher: number;
}
