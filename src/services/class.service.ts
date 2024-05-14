import { In } from "typeorm";
import { ClassStatus } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { ClassDto } from "../dto/class/class.dto";
import { Class } from "../entities/class.entity";
import * as gradeService from "./grade.service";
import * as scheduleService from "./schedule.service";
import * as semesterService from "./semester.service";
import * as studentService from "./student.service";
import * as teacherService from "./teacher.service";
import * as teachingService from "./teaching.service";

const classRepository = AppDataSource.getRepository(Class);

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

export async function getClassesByGrade(
  gradeId: number,
  year?: number
): Promise<Class[]> {
  const school_year = year
    ? year + "-" + (year + 1)
    : new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
  const classes = await classRepository.find({
    where: { school_year, grade: { id: gradeId } },
    select: ["id", "name"],
  });
  return classes;
}

export async function getClassByGrades(
  gradeNames: number[]
): Promise<Class | null> {
  return classRepository.findOne({
    where: { grade: { name: In(gradeNames) } },
  });
}

export async function getActiveClassByStudent(
  studentId: number
): Promise<Class | null> {
  return await classRepository.findOne({
    where: {
      status: ClassStatus.ACTIVE,
      students: {
        id: studentId,
      },
    },
  });
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
  const existingGrade = await gradeService.getGradeById(grade);
  if (!existingGrade) return "grade.not_exist";
  const existingTeacher = await teacherService.getTeacherById(teacher);
  if (!existingTeacher) return "teacher.not_exist";
  let existingSemesters = await semesterService.getSemestersByYear(year);
  if (existingSemesters.length === 0) {
    existingSemesters = await semesterService.createSemesters(year);
  }
  const _class = classRepository.create({
    ...classDto,
    grade: existingGrade,
    teacher: existingTeacher,
    school_year: year,
  });
  const classInstance = await classRepository.save(_class);
  await scheduleService.createClassSchedule(classInstance, existingSemesters);
}

export async function updateClass(
  id: number,
  classDto: ClassDto
): Promise<void | string> {
  const { name, teacher, status } = { ...classDto };
  const _class = await classRepository.findOne({
    where: { id },
    relations: ["grade", "teacher"],
    loadRelationIds: { relations: ["students"] },
  });
  if (!_class) return "class.not_found";
  const _teacher = await teacherService.getTeacherById(teacher)
  if (!_teacher) return "teacher.not_exist";
  _class.teacher = _teacher;
  _class.name = name;
  _class.status = status;
  await classRepository.save(_class);
}

export async function deleteClass(id: number): Promise<void | string> {
  const _class = await classRepository.findOne({
    where: { id },
    loadRelationIds: {
      relations: ["teacher", "grade", "students"],
    },
  });
  if (!_class) return "class.not_exist";
  const existingTeaching = await teachingService.getTeachingByClass(_class)
  if (existingTeaching) return "class.existing_teachings";
  if (_class.students.length > 0) return "class.existing_students";
  await classRepository.remove(_class);
}

export async function addStudentsToClass(
  studentIds: number[],
  classId: number
): Promise<void | string> {
  const students = await studentService.getStudentsByIds(studentIds);
  let isConflictClass = false;
  students.map((s) => {
    s.class_schools.map((_class: Class) => {
      if (_class.grade.id === +s.grade) isConflictClass = true;
    });
  });
  if (isConflictClass) return "student.conflict_class";
  const _class = await classRepository.findOne({
    where: { id: classId },
    relations: ["students"],
  });
  if (!_class) return "class.not_exist";
  _class.students.push(...students);
  await classRepository.save(_class);
}

export async function removeStudentsFromClass(
  studentIds: number[],
  classId: number
): Promise<void | string> {
  const _class = await classRepository.findOne({
    where: { id: classId },
    relations: ["students"],
  });
  if (!_class) return "class.not_exist";
  _class.students = _class.students.filter((s) => !studentIds.includes(s.id));
  await classRepository.save(_class);
}
