import { faker } from "@faker-js/faker";
import { DataSource, Repository } from "typeorm";
import { AccountRoles, Genders } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { Account } from "../entities/account.entity";
import { Staff } from "../entities/staff.entity";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";
import * as commonService from "../services/common.service";

let connection: DataSource;
let studentRepository: Repository<Student>;
let teacherRepository: Repository<Teacher>;
let staffRepository: Repository<Staff>;
let accountRepository: Repository<Account>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  studentRepository = AppDataSource.getRepository(Student);
  teacherRepository = AppDataSource.getRepository(Teacher);
  staffRepository = AppDataSource.getRepository(Staff);
  accountRepository = AppDataSource.getRepository(Account);
});

afterAll(async () => {
  await connection.destroy();
});

describe("checkExistingEmail", () => {
  it("should return false when email has not been used by other users", async () => {
    const params = {
      email: "test123321@gmail.com",
    };
    const result = await commonService.isExistingEmail(params.email);

    expect(result).toBe(false);
  });

  it("should return false when email has been used by current user", async () => {
    let existingUser =
      (await studentRepository.findOneBy({})) ||
      (await teacherRepository.findOneBy({})) ||
      (await staffRepository.findOneBy({}));
    if (!existingUser) {
      const _account = accountRepository.create({
        username: "staff1",
        password: "test123",
        role: AccountRoles.STAFF,
      });
      const account = await accountRepository.save(_account);
      const _staff = staffRepository.create({
        name: faker.person.fullName(),
        address: faker.location.streetAddress(),
        email: "test123@gmail.com",
        phone: faker.string.numeric(10),
        gender: Genders.MALE,
        date_of_birth: new Date(2005, 0, 1),
        account,
      });
      existingUser = await staffRepository.save(_staff);
    }
    const result = await commonService.isExistingEmail(
      existingUser.email,
      existingUser.id
    );

    expect(result).toBe(false);
  });

  it("should return true when email has been used by other user", async () => {
    let existingUser =
      (await studentRepository.findOneBy({})) ||
      (await teacherRepository.findOneBy({})) ||
      (await staffRepository.findOneBy({}));
    if (!existingUser) {
      const _account = accountRepository.create({
        username: "staff1",
        password: "test123",
        role: AccountRoles.STAFF,
      });
      const account = await accountRepository.save(_account);
      const _staff = staffRepository.create({
        name: faker.person.fullName(),
        address: faker.location.streetAddress(),
        email: "test123@gmail.com",
        phone: faker.string.numeric(10),
        gender: Genders.MALE,
        date_of_birth: new Date(2005, 0, 1),
        account,
      });
      existingUser = await staffRepository.save(_staff);
    }
    const result = await commonService.isExistingEmail(
      existingUser.email,
    );

    expect(result).toBe(true);
  });
});
