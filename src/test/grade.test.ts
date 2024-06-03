import { DataSource, In, Repository } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import * as gradeService from "../services/grade.service";
import { Class } from "../entities/class.entity";
import { Grade } from "../entities/grade.entity";

let connection: DataSource;
let classRepository: Repository<Class>;
let gradeRepository: Repository<Grade>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  classRepository = AppDataSource.getRepository(Class);
  gradeRepository = AppDataSource.getRepository(Grade)
});

afterAll(async () => {
  await connection.destroy();
});

describe("getGrades", () => {
  it("should return grades with ascending order of name", async () => {
    const grades = await gradeService.getGrades();

    expect(grades).not.toBeNull();
    expect(grades).toBeInstanceOf(Array);
    for (let i = 0; i < grades.length - 1; i++) {
      expect(grades[i].name <= grades[i + 1].name).toBe(true);
    }
  });
});

describe("getGradeById", () => {
  it("should return grade for corresponding id", async () => {
    const id = 19;
    const grade = await gradeService.getGradeById(id);

    expect(grade).not.toBeNull();
    expect(grade?.id).toBe(id);
  });

  it("should return null when id is not exist", async () => {
    const id = -1;
    const grade = await gradeService.getGradeById(id);

    expect(grade).toBeNull();
  });
});

describe("getGradesByIds", () => {
  it("should return grades for corresponding id array", async () => {
    const ids = [19, 20, 21, 22];
    const grades = await gradeService.getGradesById(ids);

    expect(grades).not.toBeNull();
    expect(grades).toBeInstanceOf(Array);
    expect(grades.length).toBe(4);
  });
});

describe("createGrades", () => {
  it("should create grades with grade names array", async () => {
    const gradeNames = [10, 11, 12];
    const oldGrades = await gradeService.getGrades();
    await gradeService.createGrades(gradeNames);
    const newGrades = await gradeService.getGrades();

    expect(newGrades.length - oldGrades.length).toBe(gradeNames.length);
  });

  it("should not create any grades when grade names is existing", async () => {
    const gradeNames = [6, 7, 8, 9];
    const oldGrades = await gradeService.getGrades();
    await gradeService.createGrades(gradeNames);
    const newGrades = await gradeService.getGrades();

    expect(newGrades.length === oldGrades.length).toBe(true);
  });
});

describe("deleteGrades", () => {
  it("should delete grades with grade names array", async () => {
    const gradeNames = [10, 11, 12];
    const oldGrades = await gradeService.getGrades();
    await gradeService.deleteGrades(gradeNames);
    const newGrades = await gradeService.getGrades();

    expect(oldGrades.length - newGrades.length).toBe(gradeNames.length);
  });

  it("should return false when any grades had class", async () => {
    const gradeNames = [6, 7];
    const _class = await classRepository.findOneBy({
      grade: { name: In(gradeNames) },
    });
    if (!_class) {
      const grade = await gradeRepository.findOneBy({ name: gradeNames[0] });
      const newClass = classRepository.create({
        name: "6A",
        school_year: "2024-2025",
        teacher: { id: 1 },
        grade: grade!,
      });
      await classRepository.save(newClass);
    }
    const oldGrades = await gradeService.getGrades();
    const deleteResult = await gradeService.deleteGrades(gradeNames);
    const newGrades = await gradeService.getGrades();

    expect(deleteResult).toBe(false);
    expect(newGrades.length === oldGrades.length).toBe(true);
  });
});
