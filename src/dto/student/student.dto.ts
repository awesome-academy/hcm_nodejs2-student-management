import {
  IsDate,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  MinLength
} from "class-validator";
import { Genders, StudentStatus } from "../../common/constants";
import { IsBeforeCurrentDate } from "../../common/validators";

export class StudentDto {
  @IsNotEmpty({ message: "student.name_not_empty" })
  name: string;

  @MinLength(5, { message: "student.address_min_length" })
  address: string;

  @IsNotEmpty({ message: "student.email_not_empty" })
  @IsEmail({}, { message: "student.email_invalid" })
  email: string;

  @IsNotEmpty({ message: "student.phone_not_empty" })
  @IsMobilePhone("vi-VN", {}, { message: "student.phone_invalid" })
  phone: string;

  @IsEnum(Genders, { message: "student.gender_invalid" })
  gender: Genders;

  @IsDate({ message: "student.dob_invalid" })
  @IsBeforeCurrentDate()
  date_of_birth: Date;

  @IsNotEmpty({ message: "student.grade_not_empty" })
  grade: number;

  @IsEnum(StudentStatus, { message: "student.status_invalid" })
  status: StudentStatus;
}
