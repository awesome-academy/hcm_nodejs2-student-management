import { In } from "typeorm";
import { AccountRoles, ClassStatus, StudentStatus } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { StudentDto } from "../dto/student/student.dto";
import { Student } from "../entities/student.entity";
import * as accountService from "./account.service";
import * as classService from "./class.service";
import * as gradeService from "./grade.service"

const studentRepository = AppDataSource.getRepository(Student);

export async function getStudents(): Promise<any[]> {
  let allStudents: any[] = [];
  const students = await studentRepository.find({ relations: ["grade"] });
  const promises = Promise.all(
    students.map(async (s) => {
      const _class = await classService.getActiveClassByStudent(s.id);
      allStudents.push({
        ...s,
        grade: s.grade.name,
        _class: _class ? _class.name : undefined,
      });
    })
  );
  await promises;
  return allStudents;
}

export async function getStudentsByIds(studentIds: number[]): Promise<Student[]> {
  return await studentRepository.find({
    where: { id: In(studentIds) },
    relations: {
      class_schools: {
        grade: true,
      },
    },
    loadRelationIds: {
      relations: ["grade"],
    },
  });
}

export async function getStudentById(id: number): Promise<Student | null> {
  return await studentRepository.findOne({
    where: { id },
    relations: ["class_schools"]
  });
}

export async function createStudent(
  studentDto: StudentDto
): Promise<void | string> {
  const { grade } = { ...studentDto };
  const existingGrade = await gradeService.getGradeById(grade)
  if (!existingGrade) return "grade.not_exist";
  const _student = studentRepository.create({
    ...studentDto,
    grade: existingGrade,
  });
  const student = await studentRepository.save(_student);
  const account = await accountService.createAccount(
    AccountRoles.STUDENT,
    student.id,
    student.email
  );
  student.account = account;
  await studentRepository.save(student);
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
      relations: ["account", "student_scores"],
    },
    relations: ["class_schools"],
  });
  if (!student) return "student.not_exist";
  if (student.student_scores.length > 0) return "student.existing_scores";
  const isActiveClass = student.class_schools.filter(
    (_class) => _class.status === ClassStatus.ACTIVE
  );
  if (isActiveClass.length > 0) return "student.existing_active_class";
  await accountService.deleteAccount(+student.account);
}
