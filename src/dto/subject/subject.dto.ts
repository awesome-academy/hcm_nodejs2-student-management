import { IsArray, IsNotEmpty } from 'class-validator';

export class SubjectDto {
  @IsNotEmpty({message: "subject.name_not_empty"})
  name: string;

  @IsArray({message: "subject.grade_invalid"})
  grades: string[];
}
