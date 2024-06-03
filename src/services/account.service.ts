import bcryptjs from "bcryptjs";
import { AccountRoles } from "../common/constants";
import { sendAccountInfo } from "../common/utils";
import { Account } from "../entities/account.entity";
import { AppDataSource } from "../config/typeorm";

const accountRepository = AppDataSource.getRepository(Account);

export async function createAccount(
  role: AccountRoles,
  id: number,
  email: string
): Promise<Account | null> {
  let username;
  switch (role) {
    case AccountRoles.TEACHER:
      username = "teacher" + id;
      break;
    case AccountRoles.STUDENT:
      username = "student" + id;
      break;
    default:
      return null;
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

export async function deleteAccount(id: number): Promise<void> {
  const account = await accountRepository.findOne({
    where: { id },
  });
  if (!account) return;
  await accountRepository.remove(account);
}
