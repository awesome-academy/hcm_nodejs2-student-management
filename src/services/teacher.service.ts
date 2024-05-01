import { In, IsNull } from "typeorm";
import { AccountRoles } from "../common/constants";
import { createAccount } from "./common.service";
import { AppDataSource } from "../config/typeorm";
import { TeacherDto } from "../dto/teacher/teacher.dto";
import { Account } from "../entities/account.entity";
import { Subject } from "../entities/subject.entity";
import { Teacher } from "../entities/teacher.entity";
import * as subjectService from "./subject.service";
import { Class } from "../entities/class.entity";

const teacherRepository = AppDataSource.getRepository(Teacher);
const subjectRepository = AppDataSource.getRepository(Subject);
const accountRepository = AppDataSource.getRepository(Account);
const classRepository = AppDataSource.getRepository(Class);

export async function getTeachers(): Promise<Teacher[]> {
  return await teacherRepository.find({
    order: { name: "ASC" },
    relations: ["subjects", "classes"],
  });
}

export async function getNonHomeRoomTeachers(year: number): Promise<Teacher[]> {
  const allTeachers =  await teacherRepository.find({
    order: { name: "ASC" },
    select: ["name", "id"]
  });
  const school_year = year + '-' + (year+1)
  const classes = await classRepository.find({where: {school_year}, loadRelationIds: {relations: ["teacher"]}});
  const homeroomTeacherIds = classes.map(_class => +_class.teacher);
  const teachers = allTeachers.filter(teacher => !homeroomTeacherIds.includes(teacher.id) );
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
  const account = await createAccount(
    AccountRoles.TEACHER,
    teacher.id,
    teacher.email
  );
  teacher.account = account;
  await teacherRepository.save(teacher);
  await Promise.all(
    existingSubjects.map(async (subject) => {
      if (!subject.teachers) subject.teachers = [teacher];
      else subject.teachers.push(teacher);
      await subjectRepository.save(subject);
    })
  );
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
    loadRelationIds: { relations: ["subjects"] },
  });
  if (!teacher) return;
  const oldSubjects = await subjectRepository.find({
    where: { id: In(teacher.subjects) },
    relations: ["teachers"],
  });
  await Promise.all(
    oldSubjects.map(async (subject) => {
      subject.teachers = subject.teachers.filter(
        (teacher) => teacher.id !== id
      );
      await subjectRepository.save(subject);
    })
  );
  const existingSubjects = await subjectRepository.find({
    where: { id: In(subjects) },
    relations: ["teachers"],
  });
  teacher.name = name;
  teacher.address = address;
  teacher.email = email;
  teacher.phone = phone;
  teacher.gender = gender;
  teacher.date_of_birth = date_of_birth;
  teacher.status = status;
  teacher.subjects = existingSubjects;
  await teacherRepository.save(teacher);
  await Promise.all(
    existingSubjects.map(async (subject) => {
      if (!subject.teachers) subject.teachers = [teacher];
      else subject.teachers.push(teacher);
      await subjectRepository.save(subject);
    })
  );
}

export async function deleteTeacher(id: number): Promise<void | string> {
  const teacher = await teacherRepository.findOne({
    where: { id },
    loadRelationIds: {
      relations: ["account", "subjects", "teachings", "classes"],
    },
  });
  if (!teacher) return;
  if (teacher.teachings.length > 0 || teacher.classes.length > 0)
    return "teacher.existing_teachings";
  const subjects = await subjectRepository.find({
    where: { id: In(teacher.subjects) },
    relations: ["teachers"],
  });
  const account = await accountRepository.findOne({
    where: { id: +teacher.account },
  });
  await Promise.all(
    subjects.map(async (subject) => {
      subject.teachers = subject.teachers.filter(
        (teacher) => teacher.id !== id
      );
      await subjectRepository.save(subject);
    })
  );
  await teacherRepository.remove(teacher);
  await accountRepository.remove(account!);
}
