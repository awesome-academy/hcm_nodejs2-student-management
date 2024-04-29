import bcryptjs from "bcryptjs";
import { AccountRoles } from "../common/constants";
import { sendAccountInfo } from "../common/utils";
import { AppDataSource } from "../config/typeorm";
import { Account } from "../entities/account.entity";
import { Staff } from "../entities/staff.entity";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";

const teacherRepository = AppDataSource.getRepository(Teacher);
const staffRepository = AppDataSource.getRepository(Staff);
const studentRepository = AppDataSource.getRepository(Student);
const accountRepository = AppDataSource.getRepository(Account);

export async function isExistingEmail(
  email: string,
  id?: number
): Promise<boolean> {
  const existingEmail = await Promise.race([
    teacherRepository.findOneBy({ email }),
    staffRepository.findOneBy({ email }),
    studentRepository.findOneBy({ email }),
  ]);
  return !!existingEmail && existingEmail.id !== id;
}

export async function createAccount(
  role: AccountRoles,
  id: number,
  email: string
): Promise<Account> {
  let username;
  switch (role) {
    case AccountRoles.TEACHER:
      username = "teacher" + id;
      break;
    case AccountRoles.STUDENT:
      username = "student" + id;
      break;
    default:
      username = "staff" + id;
      break;
  }
  const password = createRandomPassword();
  const _account = accountRepository.create({
    username: username,
    password: password.hashedPassword,
    role,
  });
  const account = await accountRepository.save(_account);
  sendAccountInfo(email, {
    username: username,
    password: password.randomPassword,
  });
  return account;
}

const createRandomPassword = () => {
  const randomPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = bcryptjs.hashSync(randomPassword);
  return { randomPassword, hashedPassword };
};
