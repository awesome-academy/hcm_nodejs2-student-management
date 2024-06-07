import { faker } from "@faker-js/faker";
import { DataSource, Repository } from "typeorm";
import {
  Days,
  Genders,
  Periods,
  TeacherStatus
} from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { TeacherCheckQueryDto } from "../dto/teacher/teacher-check-query.dto";
import { TeacherQueryDto } from "../dto/teacher/teacher-query.dto";
import { TeacherDto } from "../dto/teacher/teacher.dto";
import { Class } from "../entities/class.entity";
import { Teacher } from "../entities/teacher.entity";
import { Teaching } from "../entities/teaching.entity";
import * as teacherService from "../services/teacher.service";

let connection: DataSource;
let teacherRepository: Repository<Teacher>;
let teachingRepository: Repository<Teaching>;
let classRepository: Repository<Class>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  teacherRepository = AppDataSource.getRepository(Teacher);
  teachingRepository = AppDataSource.getRepository(Teaching);
  classRepository = AppDataSource.getRepository(Class);
});

afterAll(async () => {
  await connection.destroy();
});

describe("getTeachers", () => {
  it("should return all teachers", async () => {
    const teachers = await teacherService.getTeachers();

    expect(teachers).not.toBeNull();
    expect(teachers).toBeInstanceOf(Array);
  });
});

describe("getTeacherById", () => {
  it("should return teacher for corresponding id", async () => {
    const id = 1;
    const teacher = await teacherService.getTeacherById(id);

    expect(teacher).not.toBeNull();
    expect(teacher?.id).toBe(id);
  });

  it("should return null when id does not exist", async () => {
    const id = -1;
    const teacher = await teacherService.getTeacherById(id);

    expect(teacher).toBeNull();
  });
});

describe("getTeacherBySubject", () => {
  it("should return teacher for corresponding subject id", async () => {
    const subjectId = 3;
    const teacher = await teacherService.getTeacherBySubject(subjectId);

    expect(teacher).not.toBeNull();
  });

  it("should return null when no teacher found for subject id", async () => {
    const subjectId = -1;
    const teacher = await teacherService.getTeacherBySubject(subjectId);

    expect(teacher).toBeNull();
  });
});

describe("getAvailableTeachers", () => {
  it("should return available teachers for given criteria", async () => {
    const teacherQueryDto: TeacherQueryDto = {
      semester: 1,
      subject: 1,
      day: Days.MON,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const availableTeachers = await teacherService.getAvailableTeachers(
      teacherQueryDto
    );

    expect(availableTeachers).toBeInstanceOf(Array);
  });

  it("should return empty array if the semester is non-exist", async () => {
    const teacherQueryDto: TeacherQueryDto = {
      semester: -1,
      subject: 1,
      day: Days.MON,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const availableTeachers = await teacherService.getAvailableTeachers(
      teacherQueryDto
    );

    expect(availableTeachers).toBeInstanceOf(Array);
    expect(availableTeachers.length).toBe(0);
  });

  it("should return empty array if the subject is non-exist", async () => {
    const teacherQueryDto: TeacherQueryDto = {
      semester: 1,
      subject: -1,
      day: Days.MON,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const availableTeachers = await teacherService.getAvailableTeachers(
      teacherQueryDto
    );

    expect(availableTeachers).toBeInstanceOf(Array);
    expect(availableTeachers.length).toBe(0);
  });
});

describe("checkAvailableTeacher", () => {
  it("should return true if teacher is available", async () => {
    const teacherCheckQueryDto: TeacherCheckQueryDto = {
      semester: 3,
      teacher: 1,
      day: Days.TUE,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const isAvailable = await teacherService.checkAvailableTeacher(
      teacherCheckQueryDto
    );

    expect(isAvailable).toBe(true);
  });

  it("should return false if semester id is non-exist", async () => {
    const teacherCheckQueryDto: TeacherCheckQueryDto = {
      semester: -1,
      teacher: 1,
      day: Days.TUE,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const isAvailable = await teacherService.checkAvailableTeacher(
      teacherCheckQueryDto
    );

    expect(isAvailable).toBe(false);
  });

  it("should return false if teacher id is non-exist", async () => {
    const teacherCheckQueryDto: TeacherCheckQueryDto = {
      semester: 3,
      teacher: -1,
      day: Days.TUE,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const isAvailable = await teacherService.checkAvailableTeacher(
      teacherCheckQueryDto
    );

    expect(isAvailable).toBe(false);
  });

  it("should return false if teacher has conflict schedule", async () => {
    const teacherCheckQueryDto: TeacherCheckQueryDto = {
      semester: 3,
      teacher: 1,
      day: Days.MON,
      start: Periods.FIRST,
      end: Periods.SECOND,
    };
    const isAvailable = await teacherService.checkAvailableTeacher(
      teacherCheckQueryDto
    );

    expect(isAvailable).toBe(false);
  });
});

describe("getNonHomeRoomTeachers", () => {
  it("should return non-homeroom teachers for given year", async () => {
    const year = 2024;
    const nonHomeRoomTeachers = await teacherService.getNonHomeRoomTeachers(
      year
    );

    expect(nonHomeRoomTeachers).toBeInstanceOf(Array);
  });
});

describe("createTeacher", () => {
  it("should create a new teacher and associated account", async () => {
    const teacherDto: TeacherDto = {
      name: faker.person.fullName(),
      email: "accounttest@gmail.com",
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(10),
      gender: Genders.MALE,
      date_of_birth: new Date(2005, 0, 1),
      status: TeacherStatus.ACTIVE,
      subjects: [1],
    };
    const oldCount = await teacherRepository.count();
    await teacherService.createTeacher(teacherDto);
    const newCount = await teacherRepository.count();

    expect(newCount - oldCount).toBe(1);
  });
});

describe("updateTeacher", () => {
  it("should update an existing teacher", async () => {
    const teachers = await teacherService.getTeachers();
    const id = teachers[0].id;
    const teacherDto: TeacherDto = {
      ...teachers[0],
      subjects: [1],
      phone: faker.string.numeric(10),
    };
    await teacherService.updateTeacher(id, teacherDto);
    const updatedTeacher = await teacherService.getTeacherById(id);

    expect(updatedTeacher).not.toBeNull();
    expect(updatedTeacher?.phone).toBe(teacherDto.phone);
  });

  it("should not update teacher if id is non-exist", async () => {
    const id = -1;
    const teacherDto: TeacherDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(10),
      gender: Genders.MALE,
      date_of_birth: new Date(2005, 0, 1),
      status: TeacherStatus.ACTIVE,
      subjects: [1],
    };
    await teacherService.updateTeacher(id, teacherDto);
    const updatedTeacher = await teacherService.getTeacherById(id);

    expect(updatedTeacher).toBeNull();
  });
});

describe("deleteTeacher", () => {
  it("should delete a teacher without existing teachings or classes", async () => {
    const teacher = await teacherRepository.findOneBy({
      email: "accounttest@gmail.com",
    });
    const oldCount = await teacherRepository.count();
    await teacherService.deleteTeacher(teacher?.id!);
    const newCount = await teacherRepository.count();
    const deletedTeacher = await teacherService.getTeacherById(teacher?.id!);

    expect(deletedTeacher).toBeNull();
    expect(oldCount - newCount).toBe(1);
  });

  it("should return i18next message if teacher has existing teachings", async () => {
    const teaching = await teachingRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["teacher"] },
    });
    const oldCount = await teacherRepository.count();
    const result = await teacherService.deleteTeacher(+teaching?.teacher!);
    const newCount = await teacherRepository.count();

    expect(result).toBe("teacher.existing_teachings");
    expect(oldCount === newCount).toBe(true);
  });

  it("should return i18next message if teacher has classes", async () => {
    const _class = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["teacher"] },
    });
    const oldCount = await teacherRepository.count();
    const result = await teacherService.deleteTeacher(+_class?.teacher!);
    const newCount = await teacherRepository.count();

    expect(result).toBe("teacher.existing_teachings");
    expect(oldCount === newCount).toBe(true);
  });

  it("should return i18next message if teacher id is non-exist", async () => {
    const id = -1;
    const oldCount = await teacherRepository.count();
    const result = await teacherService.deleteTeacher(id);
    const newCount = await teacherRepository.count();

    expect(result).toBe("teacher.not_exist");
    expect(oldCount === newCount).toBe(true);
  });
});
