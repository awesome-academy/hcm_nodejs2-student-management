import { DataSource } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import * as semesterService from "../services/semester.service";
import { SemesterNames } from "../common/constants";

let connection: DataSource;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
});

afterAll(async () => {
  await connection.destroy();
});

describe("getDistinctSchoolYears", () => {
  it("should return distinct school years of all semesters", async () => {
    const schoolYears = await semesterService.getDistinctSchoolYears();

    expect(schoolYears).not.toBeNull();
    expect(schoolYears).toBeInstanceOf(Array);
    const uniqueSchoolYears = Array.from(new Set(schoolYears));
    expect(uniqueSchoolYears.length).toBe(schoolYears.length);
  });
});

describe("createSemesters", () => {
  it("should return 2 semesters of corresponding school year", async () => {
    const school_year = "2024-2025";
    const semesters = await semesterService.createSemesters(school_year);

    expect(semesters).not.toBeNull();
    expect(semesters).toBeInstanceOf(Array);
    expect(semesters.length).toBe(2);
  });
});

describe("getSemestersByYear", () => {
  it("should return semesters of corresponding school year", async () => {
    const school_year = "2020-2021";
    const semesters = await semesterService.getSemestersByYear(school_year);

    expect(semesters).not.toBeNull();
    expect(semesters).toBeInstanceOf(Array);
  });
});

describe("getSemesterById", () => {
  it("should return semester for corresponding id", async () => {
    const id = 3;
    const semester = await semesterService.getSemesterById(id);

    expect(semester).not.toBeNull();
    expect(semester?.id).toBe(id);
  });

  it("should return null when id is not exist", async () => {
    const id = -1;
    const semester = await semesterService.getSemesterById(id);

    expect(semester).toBeNull();
  });
});

describe("getSemesterByData", () => {
  it("should return semester for corresponding data", async () => {
    const params = {
      name: SemesterNames.FIRST,
      school_year: "2024-2025",
    };
    const semester = await semesterService.getSemesterByData(
      params.name,
      params.school_year
    );

    expect(semester).not.toBeNull();
    expect(semester?.name).toBe(params.name);
    expect(semester?.school_year).toBe(params.school_year);
  });

  it("should return null when no semesters found with provided data", async () => {
    const params = {
      name: SemesterNames.FIRST,
      school_year: "123",
    };
    const semester = await semesterService.getSemesterByData(
      params.name,
      params.school_year
    );

    expect(semester).toBeNull();
  });
});
