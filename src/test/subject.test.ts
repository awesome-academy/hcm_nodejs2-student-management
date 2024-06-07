import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import { Subject } from "../entities/subject.entity";
import { Teacher } from "../entities/teacher.entity";
import { Teaching } from "../entities/teaching.entity";
import * as subjectService from "../services/subject.service";

let connection: DataSource;
let teachingRepository: Repository<Teaching>;
let teacherRepository: Repository<Teacher>;
let subjectRepository: Repository<Subject>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  teacherRepository = AppDataSource.getRepository(Teacher);
  teachingRepository = AppDataSource.getRepository(Teaching);
  subjectRepository = AppDataSource.getRepository(Subject);
});

afterAll(async () => {
  await connection.destroy();
});

describe("getSubjects", () => {
  it("should return all subjects", async () => {
    const subjects = await subjectService.getSubjects();

    expect(subjects).not.toBeNull();
    expect(subjects).toBeInstanceOf(Array);
  });
});

describe("getSubjectById", () => {
  it("should return subject for corresponding id", async () => {
    const id = 3;
    const subject = await subjectService.getSubjectById(id);

    expect(subject).not.toBeNull();
    expect(subject?.id).toBe(id);
  });

  it("should return null when id does not exist", async () => {
    const id = -1;
    const subject = await subjectService.getSubjectById(id);

    expect(subject).toBeNull();
  });
});

describe("getSubjectsById", () => {
  it("should return subjects for corresponding ids", async () => {
    const ids = [1, 2, 3];
    const subjects = await subjectService.getSubjectsById(ids);

    expect(subjects).not.toBeNull();
    expect(subjects).toBeInstanceOf(Array);
  });
});

describe("getSubjectsByGrade", () => {
  it("should return subjects for corresponding grade id", async () => {
    const gradeId = 20;
    const subjects = await subjectService.getSubjectsByGrade(gradeId);

    expect(subjects).not.toBeNull();
    expect(subjects).toBeInstanceOf(Array);
  });

  it("should return empty array when grade id does not exist", async () => {
    const gradeId = -1;
    const subjects = await subjectService.getSubjectsByGrade(gradeId);

    expect(subjects).toBeInstanceOf(Array);
    expect(subjects.length).toBe(0);
  });
});

describe("createSubject", () => {
  it("should create a new subject", async () => {
    const name = "Văn";
    const grades = [19, 20];
    await subjectService.createSubject(name, grades);

    const subjects = await subjectService.getSubjects();
    const createdSubject = subjects.find((subject) => subject.name === name);

    expect(createdSubject).not.toBeNull();
    expect(createdSubject?.name).toBe(name);
  });
});

describe("updateSubject", () => {
  it("should update an existing subject", async () => {
    const subject = await subjectRepository.findOneBy({ name: "Văn" });
    const newName = "Ngữ văn";
    const newGrades = [20, 21];
    await subjectService.updateSubject(subject?.id!, newName, newGrades);

    const updatedSubject = await subjectService.getSubjectById(subject?.id!);
    expect(updatedSubject).not.toBeNull();
    expect(updatedSubject?.name).toBe(newName);
  });

  it("should not update a non-existing subject", async () => {
    const id = -1;
    const newName = "Non-Existing Subject";
    const newGrades = [2, 3];
    await subjectService.updateSubject(id, newName, newGrades);

    const updatedSubject = await subjectService.getSubjectById(id);
    expect(updatedSubject).toBeNull();
  });
});

describe("isExistingSubject", () => {
  it("should return true if subject exists", async () => {
    let existingSubject = await subjectRepository.findOneBy({});
    if (!existingSubject) {
      const subject = subjectRepository.create({
        name: "Vật lý",
      });
      existingSubject = await subjectRepository.save(subject);
    }
    const exists = await subjectService.isExistingSubject(existingSubject.name);

    expect(exists).toBe(true);
  });

  it("should return false if subject does not exist", async () => {
    const name = "Hóa";
    const exists = await subjectService.isExistingSubject(name);

    expect(exists).toBe(false);
  });
});

describe("deleteSubject", () => {
  it("should delete a subject without existing teachings or teachers", async () => {
    const subject = await subjectRepository.findOneBy({ name: "Ngữ văn" });
    await subjectService.deleteSubject(subject?.id!);

    const deletedSubject = await subjectService.getSubjectById(subject?.id!);
    expect(deletedSubject).toBeNull();
  });

  it("should return i18next message if subject had teachings", async () => {
    const teaching = await teachingRepository.findOne({
      where: {},
      loadRelationIds: {
        relations: ["subject"],
      },
    });
    const result = await subjectService.deleteSubject(+teaching?.subject!);

    expect(result).toBe("subject.existing_teachings");
  });

  it("should return i18next message if subject had teachers", async () => {
    //this subject has teacher but not have any teachings
    const id = 4;
    const result = await subjectService.deleteSubject(id);

    expect(result).toBe("subject.existing_teachers");
  });
});
