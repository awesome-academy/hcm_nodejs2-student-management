import { In } from "typeorm";
import { AccountRoles, ClassStatus } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { StudentDto } from "../dto/student/student.dto";
import { Account } from "../entities/account.entity";
import { Class } from "../entities/class.entity";
import { Student } from "../entities/student.entity";
import { createAccount } from "./common.service";

const classRepository = AppDataSource.getRepository(Class);
const studentRepository = AppDataSource.getRepository(Student);
const accountRepository = AppDataSource.getRepository(Account);

export async function getStudents(): Promise<any[]> {
  const school_year =
    new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);
  const classes = await classRepository.find({
    where: { school_year, status: ClassStatus.ACTIVE },
    relations: ["students"],
    loadRelationIds: { relations: ["grade"] },
  });
  let allStudents: any[] = [];
  classes.forEach((classObj) => {
    classObj.students.forEach((student) => {
      allStudents.push({
        ...student,
        _class: classObj.name,
        grade: classObj.grade,
        classId: classObj.id,
      });
    });
  });

  return allStudents;
}

export async function createStudent(
  studentDto: StudentDto
): Promise<void | string> {
  const { _class } = { ...studentDto };
  const existingClass = await classRepository.findOne({
    where: { id: _class },
    relations: ["students"],
  });
  if (!existingClass) return "class.not_exist";
  const _student = studentRepository.create({
    ...studentDto,
    class_schools: [existingClass],
  });
  const student = await studentRepository.save(_student);
  const account = await createAccount(
    AccountRoles.STUDENT,
    student.id,
    student.email
  );
  student.account = account;
  await studentRepository.save(student);
  if (!existingClass.students) existingClass.students = [student];
  else existingClass.students.push(student);
  await classRepository.save(existingClass);
}

export async function updateStudent(
  id: number,
  studentDto: StudentDto
): Promise<void | string> {
  const { name, address, email, phone, gender, date_of_birth, status } = {
    ...studentDto,
  };
  const student = await studentRepository.findOne({
    where: { id },
  });
  if (!student) return "student.not_exist";
  const updatedStudent = {
    ...student,
    name,
    address,
    email,
    phone,
    gender,
    date_of_birth,
    status,
  };
  await studentRepository.save(updatedStudent);
}

export async function deleteStudent(id: number): Promise<void | string> {
  const student = await studentRepository.findOne({
    where: { id },
    loadRelationIds: {
      relations: ["account", "class_schools", "student_scores"],
    },
  });
  if (!student) return "student.not_exist";
  if (student.student_scores.length > 0) return "student.existing_scores";
  const classes = await classRepository.find({
    where: { id: In(student.class_schools) },
    relations: ["students"],
  });
  const account = await accountRepository.findOne({
    where: { id: +student.account },
  });
  await Promise.all(
    classes.map(async (_class) => {
      _class.students = _class.students.filter(
        (_student) => _student.id !== id
      );
      await classRepository.save(classes);
    })
  );
  await studentRepository.remove(student);
  await accountRepository.remove(account!);
}
