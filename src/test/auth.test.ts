import { DataSource } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import { Teacher } from "../entities/teacher.entity";
import * as authService from "../services/auth.service";
import { Student } from "../entities/student.entity";
import { Staff } from "../entities/staff.entity";

let connection: DataSource;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe("login", () => {
  it("should return teacher when teacher login information is valid", async () => {
    const loginParams = {
      username: "teacher60",
      password: "mj2iu7gu",
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
      username: "student6",
      password: "fs20lxhb",
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
      password: "test",
    };
    const user = await authService.validateLogin(
      loginParams.username,
      loginParams.password
    );

    expect(user).not.toBeNull();
    expect(user).toBeInstanceOf(Staff);
  });

  it("should i18next message when username is not exist", async () => {
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

  it("should i18next message when username is not exist", async () => {
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
