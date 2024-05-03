import bcryptjs from "bcryptjs";
import { AppDataSource } from "../config/typeorm";
import { Account } from "../entities/account.entity";
import { Staff } from "../entities/staff.entity";
import { Teacher } from "../entities/teacher.entity";
import { Student } from "../entities/student.entity";
import { AccountRoles } from "../common/constants";

const accountRepository = AppDataSource.getRepository(Account);
const staffRepository = AppDataSource.getRepository(Staff);
const teacherRepository = AppDataSource.getRepository(Teacher);
const studentRepository = AppDataSource.getRepository(Student);

export async function validateLogin(
  username: string,
  password: string
): Promise<string | Staff | Teacher | Student> {
  const account = await accountRepository.findOneBy({ username });
  if (!account) return "username.notfound";
  const isValidPassword = bcryptjs.compareSync(password, account.password);
  if (!isValidPassword) return "password.wrong";
  let repository;
  switch (account.role) {
    case AccountRoles.STAFF:
      repository = staffRepository;
      break;
    case AccountRoles.TEACHER:
      repository = teacherRepository;
      break;
    case AccountRoles.STUDENT:
      repository = studentRepository;
      break;
    default:
      return "account.invalid";
  }
  const user = await repository.findOne({
    where: { account: account },
    relations: ["account"],
  });
  if (!user) return "user.notfound";
  return user;
}
