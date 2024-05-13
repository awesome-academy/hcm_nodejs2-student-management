import { SemesterNames } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { ClassDto } from "../dto/class/class.dto";
import { Class } from "../entities/class.entity";
import { Grade } from "../entities/grade.entity";
import { Semester } from "../entities/semester.entity";
import { Teacher } from "../entities/teacher.entity";

const classRepository = AppDataSource.getRepository(Class);
const gradeRepository = AppDataSource.getRepository(Grade);
const teacherRepository = AppDataSource.getRepository(Teacher);
const semesterRepository = AppDataSource.getRepository(Semester);

export async function getClasses(
  year: number,
  grade?: number,
  status?: number
): Promise<Class[]> {
  const school_year = year + "-" + (year + 1);
  let classes = await classRepository
    .createQueryBuilder("class")
    .leftJoinAndSelect("class.grade", "grade")
    .leftJoinAndSelect("class.teacher", "teacher")
    .loadRelationCountAndMap("class.studentCount", "class.students")
    .where("class.school_year = :school_year", { school_year })
    .orderBy("grade.name", "ASC")
    .getMany();

  if (grade) {
    classes = classes.filter((_class) => _class.grade.name === grade);
  }
  if (status) {
    classes = classes.filter((_class) => _class.status === status);
  }
  return classes;
}

export async function getClassesByGrade(gradeId: number): Promise<Class[]> {
  const school_year =
    new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
  const classes = await classRepository.find({
    where: { school_year, grade: { id: gradeId } },
    select: ["id", "name"],
  });
  return classes;
}

export async function getClassesByYear(school_year: string): Promise<Class[]> {
  return await classRepository.find({
    where: { school_year },
    loadRelationIds: { relations: ["teacher"] },
  });
}

export async function getClassById(id: number): Promise<Class | null> {
  return await classRepository.findOne({
    where: { id },
  });
}

export async function isExistingClass(
  classDto: ClassDto,
  id?: number
): Promise<boolean> {
  const { name, grade, school_year } = { ...classDto };
  const year = school_year + "-" + (school_year + 1);
  const existingClass = await classRepository.findOne({
    where: { name, school_year: year, grade: { id: grade } },
  });
  return !!existingClass && existingClass.id !== id;
}

export async function createClass(classDto: ClassDto): Promise<void | string> {
  const { grade, school_year, teacher } = { ...classDto };
  const year = school_year + "-" + (school_year + 1);
  const existingGrade = await gradeRepository.findOne({
    where: { id: grade },
    relations: ["classes"],
  });
  if (!existingGrade) return "grade.not_exist";
  const existingTeacher = await teacherRepository.findOne({
    where: { id: teacher },
    relations: ["classes"],
  });
  if (!existingTeacher) return "teacher.not_exist";
  const existingSemester = await semesterRepository.findOne({
    where: { school_year: year },
  });
  if (!existingSemester) {
    const firstSemester = semesterRepository.create({
      semester_name: SemesterNames.FIRST,
      school_year: year,
    });
    const secondSemester = semesterRepository.create({
      semester_name: SemesterNames.SECOND,
      school_year: year,
    });
    await semesterRepository.save([firstSemester, secondSemester]);
  }
  const _class = classRepository.create({
    ...classDto,
    grade: existingGrade,
    teacher: existingTeacher,
    school_year: year,
  });
  const classInstance = await classRepository.save(_class);
  if (!existingGrade.classes) existingGrade.classes = [classInstance];
  else existingGrade.classes.push(classInstance);
  if (!existingTeacher.classes) existingTeacher.classes = [classInstance];
  else existingTeacher.classes.push(classInstance);
  await Promise.all([
    gradeRepository.save(existingGrade),
    teacherRepository.save(existingTeacher),
  ]);
}

export async function updateClass(
  id: number,
  classDto: ClassDto
): Promise<void | string> {
  const { name, grade, teacher, status } = { ...classDto };
  const _class = await classRepository.findOne({
    where: { id: id },
    relations: ["grade", "teacher"],
    loadRelationIds: { relations: ["students"] },
  });
  if (!_class) return "class.not_found";
  if (_class.grade.id !== grade) {
    if (_class.students.length > 0) return "class.grade_reject";
    else {
      const [oldGrade, newGrade] = await Promise.all([
        gradeRepository.findOne({
          where: { id: _class.grade.id },
          relations: ["classes"],
        }),
        gradeRepository.findOne({
          where: { id: classDto.grade },
          relations: ["classes"],
        }),
      ]);
      if (!oldGrade || !newGrade) return "grade.not_exist";
      oldGrade.classes = oldGrade.classes.filter(
        (oldClass) => oldClass.id !== _class.id
      );
      newGrade.classes.push(_class);
      _class.grade = newGrade;
      await gradeRepository.save([oldGrade, newGrade]);
    }
  }
  if (_class.teacher.id !== teacher) {
    const [oldTeacher, newTeacher] = await Promise.all([
      teacherRepository.findOne({
        where: { id: _class.teacher.id },
        relations: ["classes"],
      }),
      teacherRepository.findOne({
        where: { id: classDto.teacher },
        relations: ["classes"],
      }),
    ]);
    if (!oldTeacher || !newTeacher) return "teacher.not_exist";
    oldTeacher.classes = oldTeacher.classes.filter(
      (oldClass) => oldClass.id !== _class.id
    );
    newTeacher.classes.push(_class);
    _class.teacher = newTeacher;
    await teacherRepository.save([oldTeacher, newTeacher]);
  }
  _class.name = name;
  _class.status = status;
  await classRepository.save(_class);
}

export async function deleteClass(id: number): Promise<void | string> {
  const _class = await classRepository.findOne({
    where: { id },
    loadRelationIds: {
      relations: ["teacher", "grade", "teachings", "students"],
    },
  });
  if (!_class) return;
  if (_class.teachings.length > 0) return "class.existing_teachings";
  if (_class.students.length > 0) return "class.existing_students";
  const teacher = await teacherRepository.findOne({
    where: { id: +_class.teacher },
    relations: ["classes"],
  });
  if (!teacher) return "teacher.not_exist";
  const grade = await gradeRepository.findOne({
    where: { id: +_class.grade },
    relations: ["classes"],
  });
  if (!grade) return "grade.not_exist";
  teacher.classes = teacher.classes.filter((oldClass) => oldClass.id !== id);
  grade.classes = grade.classes.filter((oldClass) => oldClass.id !== id);
  await Promise.all([
    gradeRepository.save(grade),
    teacherRepository.save(teacher),
  ]);
  await classRepository.remove(_class);
}
