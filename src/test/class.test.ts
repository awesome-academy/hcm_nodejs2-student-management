import { DataSource, Repository } from "typeorm";
import { ClassStatus, SemesterNames } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { ClassDto } from "../dto/class/class.dto";
import { Class } from "../entities/class.entity";
import { Grade } from "../entities/grade.entity";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";
import { Teaching } from "../entities/teaching.entity";
import * as classService from "../services/class.service";

let connection: DataSource;
let createdClassId: number;
let gradeRepository: Repository<Grade>;
let classRepository: Repository<Class>;
let studentRepository: Repository<Student>;
let teacherRepository: Repository<Teacher>;
let teachingRepository: Repository<Teaching>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  gradeRepository = AppDataSource.getRepository(Grade);
  classRepository = AppDataSource.getRepository(Class);
  studentRepository = AppDataSource.getRepository(Student);
  teacherRepository = AppDataSource.getRepository(Teacher);
  teachingRepository = AppDataSource.getRepository(Teaching);
});

afterAll(async () => {
  await connection.destroy();
});

describe("getClasses", () => {
  it("should return all classes for a given year", async () => {
    const year = 2024;
    const classes = await classService.getClasses(year);

    expect(classes).toBeInstanceOf(Array);
  });

  it("should return all classes of a grade name with active status for a given year", async () => {
    const year = 2024;
    const grade = await gradeRepository.findOneBy({});
    const status = ClassStatus.ACTIVE;
    const classes = await classService.getClasses(year, grade?.name!, status);

    expect(classes).toBeInstanceOf(Array);
    classes.forEach((_class) => {
      expect(_class.grade.name).toBe(grade?.name!);
      expect(_class.status).toBe(status);
    });
  });
});

describe("getClassesByGrade", () => {
  it("should return all classes for a given grade id and year", async () => {
    const grade = await gradeRepository.findOneBy({});
    const year = 2021;
    const classes = await classService.getClassesByGrade(grade?.id!, year);

    expect(classes).toBeInstanceOf(Array);
    classes.forEach((_class) => {
      expect(+_class.school_year.split("-")[0]).toBe(year);
    });
  });

  it("should return all classes for a given grade id of current year if year is not provided", async () => {
    const grade = await gradeRepository.findOneBy({});
    const classes = await classService.getClassesByGrade(grade?.id!);

    expect(classes).toBeInstanceOf(Array);
  });
});

describe("getClassByGrades", () => {
  it("should return a class for the given grade names", async () => {
    const existingClass = await classRepository.findOne({
      where: {},
      relations: ["grade"],
    });
    const gradeNames = [existingClass?.grade.name!, 10, 11];
    const _class = await classService.getClassByGrades(gradeNames);

    expect(_class).not.toBeNull();
  });

  it("should return null if there are no classes for the given grade names", async () => {
    const gradeNames = [3, 4, 5];
    const _class = await classService.getClassByGrades(gradeNames);

    expect(_class).toBeNull();
  });
});

describe("getActiveClassByStudent", () => {
  it("should return an active class for the given student id", async () => {
    const activeClass = await classRepository
      .createQueryBuilder("class")
      .leftJoinAndSelect("class.students", "student")
      .where("class.status = :status", { status: ClassStatus.ACTIVE })
      .andWhere("student.id IS NOT NULL")
      .getOne();
    const studentId = activeClass?.students[0].id!;
    const _class = await classService.getActiveClassByStudent(studentId);

    expect(_class).not.toBeNull();
    expect(_class?.id).toBe(activeClass?.id);
  });

  it("should return null if student is not in any active classes", async () => {
    const student = await studentRepository
      .createQueryBuilder("student")
      .leftJoin("student.class_schools", "class")
      .where("class.id IS NULL OR class.status != :activeStatus", {
        activeStatus: ClassStatus.ACTIVE,
      })
      .getOne();
    const _class = await classService.getActiveClassByStudent(student?.id!);

    expect(_class).toBeNull();
  });
});

describe("getClassesByYear", () => {
  it("should return all classes in a given school year", async () => {
    const school_year = "2024-2025";
    const classes = await classService.getClassesByYear(school_year);

    expect(classes).toBeInstanceOf(Array);
    classes.forEach((_class) => {
      expect(_class.school_year).toBe(school_year);
    });
  });
});

describe("getClassById", () => {
  it("should return a class for corresponding id", async () => {
    const existingClass = await classRepository.findOneBy({});
    const _class = await classService.getClassById(existingClass?.id!);

    expect(_class).not.toBeNull();
    expect(_class?.id).toBe(existingClass?.id);
  });

  it("should return null for a non-existing class id", async () => {
    const id = -1;
    const _class = await classService.getClassById(id);

    expect(_class).toBeNull();
  });
});

describe("getStudentClasses", () => {
  it("should return sorted classes for a student id", async () => {
    const existingStudent = await studentRepository.findOneBy({});
    const classes = await classService.getStudentClasses(existingStudent?.id!);

    expect(classes).toBeInstanceOf(Array);
    for (let i = 0; i < classes.length - 1; i++) {
      expect(classes[i].school_year <= classes[i + 1].school_year).toBe(true);
    }
  });

  it("should return empty array if student id is non-exist", async () => {
    const id = -1;
    const classes = await classService.getStudentClasses(id);

    expect(classes).toBeInstanceOf(Array);
    expect(classes.length).toBe(0);
  });
});

describe("getClassDetail", () => {
  it("should return a class for correspponding id", async () => {
    const existingClass = await classRepository.findOneBy({});
    const _class = await classService.getClassDetail(existingClass?.id!);

    expect(_class).not.toBeNull();
    expect(_class?.id).toBe(existingClass?.id);
  });

  it("should return null if class id is non-exist", async () => {
    const id = -1;
    const _class = await classService.getClassDetail(id);

    expect(_class).toBeNull();
  });
});

describe("getHomeRoomClassData", () => {
  it("should return a detailed class for correspponding informations", async () => {
    const existingClass = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["teacher"] },
    });
    const _class = await classService.getHomeRoomClassData(
      existingClass?.id!,
      SemesterNames.FIRST,
      +existingClass?.teacher!
    );

    expect(_class).not.toBeNull();
    expect(_class?.id).toBe(existingClass?.id);
  });

  it("should return null if no class found by provided information", async () => {
    const id = -1;
    const teacherId = 1;
    const _class = await classService.getHomeRoomClassData(
      id,
      SemesterNames.FIRST,
      teacherId
    );

    expect(_class).toBeNull();
  });
});

describe("getHomeRoomClassByYear", () => {
  it("should return a homeroom class of teacher in a year", async () => {
    const existingClass = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["teacher"] },
    });
    const year = +existingClass?.school_year.split("-")[0]!;
    const _class = await classService.getHomeRoomClassByYear(
      year,
      +existingClass?.teacher!
    );

    expect(_class).not.toBeNull();
    expect(_class?.id).toBe(existingClass?.id);
  });

  it("should return null if no class found by provided information", async () => {
    const year = 2024;
    const teacherId = -1;
    const _class = await classService.getHomeRoomClassByYear(year, teacherId);

    expect(_class).toBeNull();
  });
});

describe("getHomeRoomSchoolYears", () => {
  it("should return all homeroom school years of a teacher", async () => {
    const teacher = await teacherRepository.findOneBy({});
    const years = await classService.getHomeRoomSchoolYears(teacher?.id!);

    expect(years).toBeInstanceOf(Array);
  });
});

describe("getHomeRoomClasses", () => {
  it("should return all homeroom classes of a teacher", async () => {
    const _class = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["teacher"] },
    });
    const classes = await classService.getHomeRoomClasses(+_class?.teacher!);

    expect(classes).toBeInstanceOf(Array);
    expect(classes.length).toBeGreaterThan(0);
  });
});

describe("isExistingClass", () => {
  it("should return true if class with provided informations is exist", async () => {
    const _class = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["teacher", "grade"] },
    });
    const classDto = new ClassDto();
    classDto.grade = +_class?.grade!;
    classDto.name = _class?.name!;
    classDto.school_year = +_class?.school_year.split("-")[0]!;
    classDto.status = _class?.status!;
    classDto.teacher = +_class?.teacher!;
    const result = await classService.isExistingClass(classDto);

    expect(result).toBe(true);
  });

  it("should return false if class with provided informations is non-exist", async () => {
    const classDto = new ClassDto();
    classDto.grade = 1;
    classDto.name = "abc";
    classDto.school_year = 2024;
    classDto.status = ClassStatus.ACTIVE;
    classDto.teacher = 1;
    const result = await classService.isExistingClass(classDto);

    expect(result).toBe(false);
  });
});

describe("createClass", () => {
  it("should create a new class if the provided information is valid", async () => {
    const [grade, teacher] = await Promise.all([
      gradeRepository.findOneBy({}),
      teacherRepository.findOneBy({}),
    ]);
    const classDto: ClassDto = {
      name: "10A",
      grade: grade?.id!,
      school_year: new Date().getFullYear(),
      teacher: teacher?.id!,
      status: ClassStatus.ACTIVE,
    };
    const oldCount = await classRepository.count();
    await classService.createClass(classDto);
    const newCount = await classRepository.count();
    const _class = await classRepository.findOneBy({
      name: classDto.name,
      school_year: classDto.school_year + "-" + (classDto.school_year + 1),
    });
    createdClassId = _class?.id!;

    expect(newCount - oldCount).toBe(1);
    expect(_class).not.toBeNull();
  });

  it("should return i18next message if grade is non-exist", async () => {
    const teacher = await teacherRepository.findOneBy({});
    const classDto: ClassDto = {
      name: "10A",
      grade: -1,
      school_year: new Date().getFullYear(),
      teacher: teacher?.id!,
      status: ClassStatus.ACTIVE,
    };
    const oldCount = await classRepository.count();
    const result = await classService.createClass(classDto);
    const newCount = await classRepository.count();

    expect(newCount === oldCount).toBe(true);
    expect(result).toBe("grade.not_exist");
  });

  it("should return i18next message if teacher is non-exist", async () => {
    const grade = await gradeRepository.findOneBy({});
    const classDto: ClassDto = {
      name: "10A",
      grade: grade?.id!,
      school_year: new Date().getFullYear(),
      teacher: -1,
      status: ClassStatus.ACTIVE,
    };
    const oldCount = await classRepository.count();
    const result = await classService.createClass(classDto);
    const newCount = await classRepository.count();

    expect(newCount === oldCount).toBe(true);
    expect(result).toBe("teacher.not_exist");
  });
});

describe("updateClass", () => {
  it("should update an existing class", async () => {
    const _class = await classRepository.findOne({
      where: { id: createdClassId },
      loadRelationIds: { relations: ["grade", "teacher"] },
    });
    const classDto: ClassDto = {
      name: "abc",
      grade: +_class?.grade!,
      school_year: 2023,
      teacher: +_class?.teacher!,
      status: ClassStatus.ACTIVE,
    };
    await classService.updateClass(createdClassId, classDto);
    const updatedClass = await classService.getClassById(createdClassId);

    expect(updatedClass).not.toBeNull();
    expect(updatedClass?.name).toBe(classDto.name);
  });

  it("should return i18next message if class id is non-exist", async () => {
    const id = -1;
    const classDto: ClassDto = {
      name: "New name",
      grade: 1,
      school_year: 2023,
      teacher: 1,
      status: ClassStatus.ACTIVE,
    };
    const result = await classService.updateClass(id, classDto);

    expect(result).toBe("class.not_found");
  });

  it("should return i18next message if teacher id is non-exist", async () => {
    const _class = await classRepository.findOne({
      where: { id: createdClassId },
      loadRelationIds: { relations: ["grade"] },
    });
    const classDto: ClassDto = {
      name: "New name",
      grade: +_class?.grade!,
      school_year: 2023,
      teacher: -1,
      status: ClassStatus.ACTIVE,
    };
    const result = await classService.updateClass(_class?.id!, classDto);

    expect(result).toBe("teacher.not_exist");
  });
});

describe("deleteClass", () => {
  it("should delete an existing class", async () => {
    await classService.deleteClass(createdClassId);
    const deletedClass = await classService.getClassById(createdClassId);

    expect(deletedClass).toBeNull();
  });

  it("should return i18next message if class id is non-exist", async () => {
    const oldCount = await classRepository.count();
    const result = await classService.deleteClass(-1);
    const newCount = await classRepository.count();

    expect(oldCount === newCount).toBe(true);
    expect(result).toBe("class.not_exist");
  });

  it("should return i18next message if class has existing teachings", async () => {
    const teaching = await teachingRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["class_school"] },
    });
    const oldCount = await classRepository.count();
    const result = await classService.deleteClass(+teaching?.class_school!);
    const newCount = await classRepository.count();

    expect(oldCount === newCount).toBe(true);
    expect(result).toBe("class.existing_teachings");
  });

  it("should return i18next message if class has existing students", async () => {
    const id = 3;
    const oldCount = await classRepository.count();
    const result = await classService.deleteClass(id);
    const newCount = await classRepository.count();

    expect(oldCount === newCount).toBe(true);
    expect(result).toBe("class.existing_students");
  });
});

describe("addStudentsToClass", () => {
  it("should add students to a class", async () => {
    const studentIds = [1];
    const _class = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["students"] },
    });
    const oldStudentCount = _class?.students.length!;
    await classService.addStudentsToClass(studentIds, _class?.id!);
    const newClass = await classRepository.findOne({
      where: { id: _class?.id },
      loadRelationIds: { relations: ["students"] },
    });
    const newStudentCount = newClass?.students.length!;

    expect(newStudentCount - oldStudentCount).toBe(studentIds.length);
  });

  it("should return i18next message if any students is in another class", async () => {
    const studentIds = [1];
    const _class = await classRepository.findOne({
      where: {},
      loadRelationIds: { relations: ["students"] },
    });
    const result = await classService.addStudentsToClass(
      studentIds,
      _class?.id!
    );

    expect(result).toBe("student.conflict_class");
  });

  it("should return i18next message if class is non-exist", async () => {
    const studentIds = [3, 4];
    const classId = -1;
    const result = await classService.addStudentsToClass(studentIds, classId);

    expect(result).toBe("class.not_exist");
  });
});

describe("removeStudentsFromClass", () => {
  it("should remove students from a class", async () => {
    const student = await studentRepository.findOne({
      where: { id: 1 },
      loadRelationIds: { relations: ["class_schools"] },
    });
    const classId = +student?.class_schools[0]!;
    const _class = await classRepository.findOne({
      where: { id: classId },
      loadRelationIds: {
        relations: ["students"],
      },
    });
    const oldStudentCount = _class?.students.length!;
    await classService.removeStudentsFromClass([1], classId);
    const newClass = await classRepository.findOne({
      where: { id: classId },
      loadRelationIds: { relations: ["students"] },
    });
    const newStudentCount = newClass?.students.length!;

    expect(oldStudentCount - newStudentCount).toBe(1);
  });

  it("should return i18next message if class id is not-exist", async () => {
    const studentIds = [1, 2, 3];
    const classId = -1;
    const result = await classService.removeStudentsFromClass(
      studentIds,
      classId
    );
    +expect(result).toBe("class.not_exist");
  });
});
