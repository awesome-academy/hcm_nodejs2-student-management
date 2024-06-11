import { DataSource, Repository } from "typeorm";
import { ConductTypes } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { UpdateConductDto } from "../dto/student/update-conduct.dto";
import { Class } from "../entities/class.entity";
import { Conduct } from "../entities/conduct.entity";
import { Semester } from "../entities/semester.entity";
import { Student } from "../entities/student.entity";
import * as conductService from "../services/conduct.service";

let connection: DataSource;
let conductRepository: Repository<Conduct>;
let semesterRepository: Repository<Semester>;
let classRepository: Repository<Class>;
beforeAll(async () => {
  connection = await AppDataSource.initialize();
  conductRepository = AppDataSource.getRepository(Conduct);
  semesterRepository = AppDataSource.getRepository(Semester);
  classRepository = AppDataSource.getRepository(Class);
});

afterAll(async () => {
  await connection.destroy();
});

describe("createConducts", () => {
  it("should create conducts for students for each semester", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students"],
    });
    const semesters = await semesterRepository.find({
      where: { school_year: _class?.school_year },
    });

    const oldCount = await conductRepository.count();
    await conductService.createConducts(_class?.students!, semesters);
    const newCount = await conductRepository.count();

    expect(newCount - oldCount).toBe(
      semesters.length * _class?.students.length!
    );
  });
});

describe("getConductsByData", () => {
  it("should return conducts of students for each semester", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students"],
    });
    const semesters = await semesterRepository.find({
      where: { school_year: _class?.school_year },
    });
    const studentIds = _class?.students.map((student) => student.id);
    const semesterIds = semesters.map((semester) => semester.id);

    const result = await conductService.getConductsByData(
      studentIds!,
      semesterIds
    );

    expect(result).toBeInstanceOf(Array);
  });
});

describe("getStudentConduct", () => {
  it("should return conduct of a student in a semester", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students"],
    });
    const semester = await semesterRepository.findOne({
      where: { school_year: _class?.school_year },
    });

    const result = await conductService.getStudentConduct(
      _class?.students[0].id!,
      semester?.id!
    );

    expect(result).not.toBeNull();
  });

  it("should return null if no conduct found for provided data", async () => {
    const studentId = -1;
    const semesterId = -1;
    const result = await conductService.getStudentConduct(
      studentId,
      semesterId
    );

    expect(result).toBeNull();
  });
});

describe("updateConduct", () => {
  it("should update conduct of a student", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students", "teacher"],
    });
    const semester = await semesterRepository.findOne({
      where: { school_year: _class?.school_year },
    });
    const conductDto = new UpdateConductDto();
    conductDto.conduct = ConductTypes.GOOD;
    conductDto.semester_id = semester?.id!;
    conductDto.class_id = _class?.id!;

    await conductService.updateConduct(
      _class?.students[0].id!,
      conductDto,
      _class?.teacher.id!
    );
    const updatedConduct = await conductRepository.findOneBy({
      student: { id: _class?.students[0].id! },
      semester: { id: semester?.id },
    });

    expect(updatedConduct?.type).toBe(conductDto.conduct);
  });

  it("should return i18next message if student id is non-exist", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students", "teacher"],
    });
    const semester = await semesterRepository.findOne({
      where: { school_year: _class?.school_year },
    });
    const conductDto = new UpdateConductDto();
    conductDto.conduct = ConductTypes.GOOD;
    conductDto.semester_id = semester?.id!;
    conductDto.class_id = _class?.id!;

    const result = await conductService.updateConduct(
      -1,
      conductDto,
      _class?.teacher.id!
    );

    expect(result).toBe("student.not_exist");
  });

  it("should return i18next message if class id is non-exist", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students", "teacher"],
    });
    const semester = await semesterRepository.findOne({
      where: { school_year: _class?.school_year },
    });
    const conductDto = new UpdateConductDto();
    conductDto.conduct = ConductTypes.GOOD;
    conductDto.semester_id = semester?.id!;
    conductDto.class_id = -1;

    const result = await conductService.updateConduct(
      _class?.students[0].id!,
      conductDto,
      _class?.teacher.id!
    );

    expect(result).toBe("class.not_exist");
  });

  it("should return i18next message if teacher is not homeroom teacher", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students", "teacher"],
    });
    const semester = await semesterRepository.findOne({
      where: { school_year: _class?.school_year },
    });
    const conductDto = new UpdateConductDto();
    conductDto.conduct = ConductTypes.GOOD;
    conductDto.semester_id = semester?.id!;
    conductDto.class_id = _class?.id!;

    const result = await conductService.updateConduct(
      _class?.students[0].id!,
      conductDto,
      -1
    );

    expect(result).toBe("teacher.unauthorized");
  });

  it("should return i18next message if semester is non-exist", async () => {
    const _class = await classRepository.findOne({
      where: { id: 3 },
      relations: ["students", "teacher"],
    });
    const conductDto = new UpdateConductDto();
    conductDto.conduct = ConductTypes.GOOD;
    conductDto.semester_id = -1;
    conductDto.class_id = _class?.id!;

    const result = await conductService.updateConduct(
      _class?.students[0].id!,
      conductDto,
      _class?.teacher.id!
    );

    expect(result).toBe("semester.not_exist");
  });
});

describe("deleteConducts", () => {
  it("should delete conducts", async () => {
    const conducts = await conductRepository.find();

    const oldCount = await conductRepository.count();
    await conductService.deleteConducts(conducts);
    const newCount = await conductRepository.count();

    expect(oldCount - newCount).toBe(conducts.length);
  });
});
