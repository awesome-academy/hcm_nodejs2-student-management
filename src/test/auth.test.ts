import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import { Teacher } from "../entities/teacher.entity";
import * as authService from "../services/auth.service";
import { Student } from "../entities/student.entity";
import { Staff } from "../entities/staff.entity";
import { Account } from "../entities/account.entity";
import { faker } from "@faker-js/faker";
import { Genders } from "../common/constants";

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

describe("login", () => {
  it("should return teacher when teacher login information is valid", async () => {
    const loginParams = {
      username: "teacher200",
      password: "sot84o03",
    };
    const user = await authService.validateLogin(
      loginParams.username,
      loginParams.password
    );

    expect(user).not.toBeNull();
    expect(user).toBeInstanceOf(Teacher);
  });

  it("should return student when student login information is valid", async () => {
    const loginParams = {
      username: "student201",
      password: "rn6g7ykd",
    };
    const user = await authService.validateLogin(
      loginParams.username,
      loginParams.password
    );

    expect(user).not.toBeNull();
    expect(user).toBeInstanceOf(Student);
  });

  it("should return staff when staff login information is valid", async () => {
    const loginParams = {
      username: "dinhnghia",
      password: "ldcvfxam",
    };
    const user = await authService.validateLogin(
      loginParams.username,
      loginParams.password
    );

    expect(user).not.toBeNull();
    expect(user).toBeInstanceOf(Staff);
  });

  it("should return i18next message when username is not exist", async () => {
    const loginParams = {
      username: "test",
      password: "test123",
    };
    const user = await authService.validateLogin(
      loginParams.username,
      loginParams.password
    );

    expect(user).toBe("username.notfound");
  });

  it("should return i18next message when password is incorrect", async () => {
    const loginParams = {
      username: "dinhnghia",
      password: "test123",
    };
    const user = await authService.validateLogin(
      loginParams.username,
      loginParams.password
    );

    expect(user).toBe("password.wrong");
  });
});
