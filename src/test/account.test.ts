import * as accountService from "../services/account.service";
import { AppDataSource } from "../config/typeorm";
import { DataSource, Repository } from "typeorm";
import { AccountRoles } from "../common/constants";
import { faker } from "@faker-js/faker";
import { Account } from "../entities/account.entity";

let connection: DataSource;
let accountRepository: Repository<Account>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  accountRepository = AppDataSource.getRepository(Account);
});

afterAll(async () => {
  await connection.destroy();
});

describe("createAccount", () => {
  it("should return teacher account when creating is successful", async () => {
    const accountParams = {
      role: AccountRoles.TEACHER,
      id: faker.number.int(),
      email: faker.internet.email(),
    };

    const account = await accountService.createAccount(
      accountParams.role,
      accountParams.id,
      accountParams.email
    );

    expect(account).not.toBeNull();
    expect(account?.username).toBe("teacher" + accountParams.id);
    expect(account?.role).toBe(accountParams.role);
  });

  it("should return student account when creating is successful", async () => {
    const accountParams = {
      role: AccountRoles.STUDENT,
      id: 100,
      email: faker.internet.email(),
    };

    const account = await accountService.createAccount(
      accountParams.role,
      accountParams.id,
      accountParams.email
    );

    expect(account).not.toBeNull();
    expect(account?.username).toBe("student" + accountParams.id);
    expect(account?.role).toBe(accountParams.role);
  });

  it("should return null if role is invalid", async () => {
    const accountParams = {
      role: 10,
      id: 202,
      email: "Test1215@gmail.com",
    };

    const account = await accountService.createAccount(
      accountParams.role,
      accountParams.id,
      accountParams.email
    );

    expect(account).toBeNull();
  });
});

describe("deleteAccount", () => {
  it("should delete account when account is exist", async () => {
    const account = await accountRepository.findOneBy({
      username: "student100",
    });
    await accountService.deleteAccount(account!.id);
  });

  it("should not delete account when account is not exist", async () => {
    const id = 1000;
    await accountService.deleteAccount(id);
  });
});
