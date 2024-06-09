import { faker } from "@faker-js/faker";
import { DataSource, Repository } from "typeorm";
import { Genders, StudentStatus } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { StudentDto } from "../dto/student/student.dto";
import { Class } from "../entities/class.entity";
import { Grade } from "../entities/grade.entity";
import { Student } from "../entities/student.entity";
import { StudentScore } from "../entities/student_score.entity";
import * as studentService from "../services/student.service";

let connection: DataSource;
let gradeRepository: Repository<Grade>;
let studentRepository: Repository<Student>;
let studentScoreRepository: Repository<StudentScore>;
let classRepository: Repository<Class>;
let createdStudentId: number;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  gradeRepository = AppDataSource.getRepository(Grade);
  studentRepository = AppDataSource.getRepository(Student);
  studentScoreRepository = AppDataSource.getRepository(StudentScore);
  classRepository = AppDataSource.getRepository(Class);
});

afterAll(async () => {
  await connection.destroy();
});

describe("getStudents", () => {
  it("should return all students", async () => {
    const students = await studentService.getStudents();
    expect(students).toBeInstanceOf(Array);
  });
});

describe("getStudentsByIds", () => {
  it("should return students by their IDs", async () => {
    const studentIds = [1, 2, 3];
    const students = await studentService.getStudentsByIds(studentIds);
    expect(students).toBeInstanceOf(Array);
    students.forEach((student) => {
      expect(studentIds).toContain(student.id);
    });
  });
});

describe("isNonExistIds", () => {
  it("should return false if all ids are exist", async () => {
    const students = await studentRepository.find({ where: {}, take: 5 });
    const studentIds = students.map((student) => student.id);
    const result = await studentService.isNonExistIds(studentIds);
    expect(result).toBe(false);
  });

  it("should return true if any id is non-exist", async () => {
    const studentIds = [-1, 2, 3];
    const result = await studentService.isNonExistIds(studentIds);
    expect(result).toBe(true);
  });
});

describe("getActiveStudents", () => {
  it("should return all active students", async () => {
    const students = await studentService.getActiveStudents();
    expect(students).toBeInstanceOf(Array);
    students.forEach((student) => {
      expect(student.status).toBe(StudentStatus.ACTIVE);
    });
  });
});

describe("getAvailableStudents", () => {
  it("should return available students for a specific grade", async () => {
    const grade = await gradeRepository.findOneBy({});
    const students = await studentService.getAvailableStudents(grade?.id!);
    expect(students).toBeInstanceOf(Array);
  });
});

describe("getStudentById", () => {
  it("should return a student for corresponding id", async () => {
    let student = await studentRepository.findOneBy({});
    const result = await studentService.getStudentById(student?.id!);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(student?.id);
  });

  it("should return null if id is non-exist", async () => {
    const id = -1;
    const student = await studentService.getStudentById(id);
    expect(student).toBeNull();
  });
});

describe("createStudent", () => {
  it("should create a new student if student information is valid", async () => {
    const grade = await gradeRepository.findOneBy({});
    const studentDto: StudentDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(10),
      gender: Genders.MALE,
      date_of_birth: new Date(2005, 0, 1),
      status: StudentStatus.ACTIVE,
      grade: grade?.id!,
    };
    const oldCount = await studentRepository.count();
    await studentService.createStudent(studentDto);
    const newCount = await studentRepository.count();

    const createdStudent = await studentRepository.findOneBy({
      email: studentDto.email,
    });
    expect(newCount - oldCount).toBe(1);
    expect(createdStudent).not.toBeNull();
    createdStudentId = createdStudent?.id!;
  });

  it("should return i18next message if grade id is non-exist", async () => {
    const studentDto: StudentDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(10),
      gender: Genders.MALE,
      date_of_birth: new Date(2005, 0, 1),
      status: StudentStatus.ACTIVE,
      grade: -1,
    };
    const oldCount = await studentRepository.count();
    const result = await studentService.createStudent(studentDto);
    const newCount = await studentRepository.count();

    expect(newCount === oldCount).toBe(true);
    expect(result).toBe("grade.not_exist");
  });
});

describe("updateStudent", () => {
  it("should update student for corresponding id", async () => {
    const student = await studentRepository.findOne({
      where: { id: createdStudentId },
      loadRelationIds: { relations: ["grade"] },
    });
    const studentDto: StudentDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(10),
      gender: Genders.MALE,
      date_of_birth: new Date(2005, 0, 1),
      status: StudentStatus.ACTIVE,
      grade: +student?.grade!,
    };
    await studentService.updateStudent(createdStudentId, studentDto);
    const updatedStudent = await studentService.getStudentById(
      createdStudentId
    );
    expect(updatedStudent).not.toBeNull();
    expect(updatedStudent?.name).toBe(studentDto.name);
  });

  it("should return i18next message if student id is non-exist", async () => {
    const id = -1;
    const studentDto: StudentDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(10),
      gender: Genders.MALE,
      date_of_birth: new Date(2005, 0, 1),
      status: StudentStatus.ACTIVE,
      grade: 1,
    };
    const result = await studentService.updateStudent(id, studentDto);
    expect(result).toBe("student.not_exist");
  });
});

describe("deleteStudent", () => {
  it("should delete student for corresponding id", async () => {
    const oldCount = await studentRepository.count();
    await studentService.deleteStudent(createdStudentId);
    const newCount = await studentRepository.count();
    const deletedStudent = await studentService.getStudentById(
      createdStudentId
    );

    expect(oldCount - newCount).toBe(1);
    expect(deletedStudent).toBeNull();
  });

  it("should return i18next message if student id is non-exist", async () => {
    const id = -1;
    const oldCount = await studentRepository.count();
    const result = await studentService.deleteStudent(id);
    const newCount = await studentRepository.count();

    expect(oldCount === newCount).toBe(true);
    expect(result).toBe("student.not_exist");
  });

  it("should return i18next message if student has any scores", async () => {
    const studentScore = await studentScoreRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["student"] },
    });
    const oldCount = await studentRepository.count();
    const result = await studentService.deleteStudent(+studentScore?.student!);
    const newCount = await studentRepository.count();

    expect(oldCount === newCount).toBe(true);
    expect(result).toBe("student.existing_scores");
  });

  it("should return i18next message if student is in an active class", async () => {
    const studentId = 2;
    const oldCount = await studentRepository.count();
    const result = await studentService.deleteStudent(studentId);
    const newCount = await studentRepository.count();

    expect(oldCount === newCount).toBe(true);
    expect(result).toBe("student.existing_active_class");
  });
});
