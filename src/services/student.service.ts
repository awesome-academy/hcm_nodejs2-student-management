import { In } from "typeorm";
import { AccountRoles, ClassStatus, StudentStatus } from "../common/constants";
import { AppDataSource } from "../config/typeorm";
import { StudentDto } from "../dto/student/student.dto";
import { Student } from "../entities/student.entity";
import * as accountService from "./account.service";
import * as classService from "./class.service";
import * as gradeService from "./grade.service";
import { Class } from "../entities/class.entity";

const studentRepository = AppDataSource.getRepository(Student);

export async function getStudents(): Promise<any[]> {
  let allStudents: any[] = [];
  const students = await studentRepository.find({ relations: ["grade"] });
  const promises = Promise.all(
    students.map(async (s) => {
      const _class = await classService.getActiveClassByStudent(s.id);
      allStudents.push({
        ...s,
        gradeId: s.grade.id,
        grade: s.grade.name,
        _class: _class ? _class.name : undefined,
      });
    })
  );
  await promises;
  return allStudents;
}

export async function getStudentsByIds(
  studentIds: number[]
): Promise<Student[]> {
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

export async function isNonExistIds(ids: number[]): Promise<boolean> {
  const studentChecks = ids.map((id) =>
    getStudentById(id).then((student) => ({ id, student }))
  );
  const results = await Promise.all(studentChecks);
  const nonExistentIds = results.filter((result) => !result.student);
  return nonExistentIds.length > 0;
}

export async function getActiveStudents(): Promise<Student[]> {
  return await studentRepository.find({
    where: { status: StudentStatus.ACTIVE },
  });
}

export async function getAvailableStudents(
  gradeId: number
): Promise<Student[]> {
  const grade = await gradeService.getGradeById(gradeId);
  if (!grade) return [];
  const students = await studentRepository
    .createQueryBuilder("student")
    .leftJoinAndSelect("student.class_schools", "class")
    .where("student.gradeId = :gradeId", { gradeId })
    .andWhere("student.status = :status", { status: StudentStatus.ACTIVE })
    .andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select("student.id")
        .from(Student, "student")
        .leftJoin("student.class_schools", "class")
        .where("class.gradeId = :gradeId", { gradeId })
        .getQuery();
      return `student.id NOT IN ${subQuery}`;
    })
    .getMany();

  return students;
}

export async function getStudentById(id: number): Promise<Student | null> {
  return await studentRepository.findOne({
    where: { id },
    relations: ["class_schools"],
  });
}

export async function createStudent(
  studentDto: StudentDto
): Promise<void | string> {
  const { grade } = { ...studentDto };
  const existingGrade = await gradeService.getGradeById(grade);
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
  if(!account){
    await studentRepository.remove(student);
    return "account.create_fail";
  }
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
