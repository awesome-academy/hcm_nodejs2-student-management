import { AccountRoles } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { TeacherCheckQueryDto } from "../dto/teacher/teacher-check-query.dto";
import { TeacherQueryDto } from "../dto/teacher/teacher-query.dto";
import { TeacherDto } from "../dto/teacher/teacher.dto";
import { Teacher } from "../entities/teacher.entity";
import * as classService from "./class.service";
import * as accountService from "./account.service";
import * as scheduleService from "./schedule.service";
import * as semesterService from "./semester.service";
import * as subjectService from "./subject.service";
import * as teachingService from "./teaching.service";

const teacherRepository = AppDataSource.getRepository(Teacher);

export async function getTeachers(): Promise<Teacher[]> {
  return await teacherRepository.find({
    order: { name: "ASC" },
    relations: ["subjects"],
  });
}

export async function getTeacherById(id: number): Promise<Teacher | null> {
  return await teacherRepository.findOne({
    where: { id },
    loadRelationIds: {
      relations: ["subjects"],
    },
  });
}

export async function getTeacherBySubject(id: number): Promise<Teacher | null> {
  return await teacherRepository.findOne({
    where: { subjects: { id } },
  });
}

export async function getAvailableTeachers(
  teacherQueryDto: TeacherQueryDto
): Promise<Teacher[]> {
  const { semester, subject, day, start, end } = { ...teacherQueryDto };
  const _semester = await semesterService.getSemesterById(semester);
  if (!_semester) return [];
  const _subject = await subjectService.getSubjectById(subject);
  if (!_subject) return [];
  const schedules = await scheduleService.getExistingSchedules(
    _semester,
    day,
    start,
    end
  );
  const subjectTeachers = await teacherRepository.find({
    where: { subjects: { id: subject } },
  });
  const busyTeachersSet = new Set<number>();
  schedules.forEach((schedule) => {
    busyTeachersSet.add(schedule.teacher.id);
  });
  const busyTeachers = Array.from(busyTeachersSet);
  return subjectTeachers.filter(
    (teacher) => !busyTeachers.includes(teacher.id)
  );
}

export async function checkAvailableTeacher(
  teacherCheckQueryDto: TeacherCheckQueryDto
): Promise<boolean> {
  const { semester, teacher, day, start, end } = { ...teacherCheckQueryDto };
  const _semester = await semesterService.getSemesterById(semester);
  if (!_semester) return false;
  const _teacher = await getTeacherById(teacher);
  if (!_teacher) return false;
  const schedule = scheduleService.getTeacherSchedule(
    _semester,
    day,
    start,
    end,
    teacher
  );
  return !schedule;
}

export async function getNonHomeRoomTeachers(year: number): Promise<Teacher[]> {
  const allTeachers = await teacherRepository.find({
    order: { name: "ASC" },
    select: ["name", "id"],
  });
  const school_year = year + "-" + (year + 1);
  const classes = await classService.getClassesByYear(school_year);
  const homeroomTeacherIds = classes.map((_class) => +_class.teacher);
  const teachers = allTeachers.filter(
    (teacher) => !homeroomTeacherIds.includes(teacher.id)
  );
  return teachers;
}

export async function createTeacher(teacherDto: TeacherDto): Promise<void> {
  const existingSubjects = await subjectService.getSubjectsById(
    teacherDto.subjects
  );
  const _teacher = teacherRepository.create({
    ...teacherDto,
    subjects: existingSubjects,
  });
  const teacher = await teacherRepository.save(_teacher);
  const account = await accountService.createAccount(
    AccountRoles.TEACHER,
    teacher.id,
    teacher.email
  );
  teacher.account = account;
  await teacherRepository.save(teacher);
}

export async function updateTeacher(
  id: number,
  teacherDto: TeacherDto
): Promise<void> {
  const {
    name,
    subjects,
    address,
    email,
    phone,
    gender,
    date_of_birth,
    status,
  } = teacherDto;
  const teacher = await teacherRepository.findOne({
    where: { id },
    relations: ["subjects"],
  });
  if (!teacher) return;
  const existingSubjects = await subjectService.getSubjectsById(subjects);
  const updatedTeacher = {
    ...teacher,
    name,
    address,
    email,
    phone,
    gender,
    date_of_birth,
    status,
    subjects: existingSubjects,
  };
  await teacherRepository.save(updatedTeacher);
}

export async function deleteTeacher(id: number): Promise<void | string> {
  const teacher = await teacherRepository.findOne({
    where: { id },
    loadRelationIds: {
      relations: ["classes", "account"],
    },
  });
  if (!teacher) return "teacher.not_exist";
  const existingTeaching = await teachingService.getTeachingByTeacher(teacher);
  if (existingTeaching || teacher.classes.length > 0)
    return "teacher.existing_teachings";
  await accountService.deleteAccount(+teacher.account);
}
