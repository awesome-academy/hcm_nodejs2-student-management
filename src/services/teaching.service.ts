import { Teaching } from "../entities/teaching.entity";
import { Teacher } from "../entities/teacher.entity";
import { AppDataSource } from "../config/typeorm";
import { Subject } from "../entities/subject.entity";
import { Class } from "../entities/class.entity";
import { Semester } from "../entities/semester.entity";
import * as semesterService from "./semester.service";
import * as scoreService from "./score.service";
import { Not } from "typeorm";

const teachingRepository = AppDataSource.getRepository(Teaching);

export async function getTeachingByTeacher(
  teacher: Teacher
): Promise<Teaching | null> {
  return await teachingRepository.findOne({
    where: { teacher },
  });
}

export async function getTeachingById(id: number): Promise<Teaching | null> {
  return await teachingRepository.findOne({
    where: { id },
    loadRelationIds: { relations: ["teacher"] },
    relations: ["class_school", "semester", "subject"]
  });
}

export async function getTeachingsByData(
  year: number,
  semester: number,
  teacherId: number
): Promise<Teaching[]> {
  const school_year = year + "-" + (year + 1);
  const _semester = await semesterService.getSemesterByData(
    semester,
    school_year
  );
  if (!_semester) return [];
  return await teachingRepository.find({
    where: { teacher: { id: teacherId }, semester: _semester },
    relations: {
      class_school: {
        grade: true,
        teacher: true,
      },
      subject: true,
    },
  });
}

export async function getTeachingYears(teacherId: number): Promise<string[]> {
  const distinctSchoolYears = await teachingRepository
    .createQueryBuilder("teaching")
    .leftJoin("teaching.class_school", "class")
    .select("DISTINCT(class.school_year)", "school_year")
    .where("teaching.teacher = :teacherId", { teacherId })
    .orderBy("class.school_year", "DESC")
    .getRawMany();

  return distinctSchoolYears.map((row) => row.school_year);
}

export async function getTeachingBySubject(
  subject: Subject
): Promise<Teaching | null> {
  return await teachingRepository.findOne({
    where: { subject },
  });
}

export async function getTeachingByClass(
  class_school: Class
): Promise<Teaching | null> {
  return await teachingRepository.findOne({
    where: { class_school },
  });
}

export async function getExistingTeaching(
  teacherId: number,
  subjectId: number,
  classId: number,
  semesterId: number
): Promise<Teaching | null> {
  return await teachingRepository.findOne({
    where: {
      teacher: {
        id: teacherId,
      },
      subject: {
        id: subjectId,
      },
      class_school: {
        id: classId,
      },
      semester: {
        id: semesterId,
      },
    },
  });
}

export async function createTeaching(
  teacher: Teacher,
  subject: Subject,
  class_school: Class,
  semester: Semester
): Promise<Teaching> {
  const existingTeaching = await getExistingTeaching(
    teacher.id,
    subject.id,
    class_school.id,
    semester.id
  );
  if (!existingTeaching) {
    const _teaching = teachingRepository.create({
      teacher,
      subject,
      class_school,
      semester,
    });
    await scoreService.createClassScore(class_school, subject, semester);
    return await teachingRepository.save(_teaching);
  }
  return existingTeaching;
}

export async function deleteTeaching(teaching: Teaching): Promise<void> {
  const { subject, class_school, semester, id } = { ...teaching };
  const existingTeaching = await teachingRepository.findOne({
    where: {
      subject,
      class_school,
      semester,
      id: Not(id),
    },
  });
  if (existingTeaching) await teachingRepository.remove(teaching);
  else
    await Promise.all([
      teachingRepository.remove(teaching),
      scoreService.deleteClassScore(class_school, subject, semester),
    ]);
}
