import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty({message: "username.not_empty"})
  username: string;

  @IsNotEmpty({message: "password.not_empty"})
  password: string;
}