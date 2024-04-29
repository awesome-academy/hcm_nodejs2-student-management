import {
  ArrayMinSize,
  IsDate,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  MinLength,
} from "class-validator";
import { Genders, TeacherStatus } from "../../common/constants";
import { IsBeforeCurrentDate } from "../../common/validators";

export class TeacherDto {
  @IsNotEmpty({ message: "teacher.name_not_empty" })
  name: string;

  @MinLength(5, { message: "teacher.address_min_length" })
  address: string;

  @IsNotEmpty({ message: "teacher.email_not_empty" })
  @IsEmail({}, { message: "teacher.email_invalid" })
  email: string;

  @IsNotEmpty({ message: "teacher.phone_not_empty" })
  @IsMobilePhone("vi-VN", {}, { message: "teacher.phone_invalid" })
  phone: string;

  @IsEnum(Genders, { message: "teacher.gender_invalid" })
  gender: Genders;

  @IsDate({ message: "teacher.dob_invalid" })
  @IsBeforeCurrentDate()
  date_of_birth: Date;

  @ArrayMinSize(1, { message: "teacher.subjects_min" })
  subjects: number[];

  @IsEnum(TeacherStatus, { message: "teacher.status_invalid" })
  status: TeacherStatus;
}
