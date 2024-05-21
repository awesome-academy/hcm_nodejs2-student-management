import { Teaching } from "../entities/teaching.entity";
import { Teacher } from "../entities/teacher.entity";
import { AppDataSource } from "../config/typeorm";
import { Subject } from "../entities/subject.entity";
import { Class } from "../entities/class.entity";
import { Semester } from "../entities/semester.entity";

const teachingRepository = AppDataSource.getRepository(Teaching);

export async function getTeachingByTeacher(
  teacher: Teacher
): Promise<Teaching | null> {
  return await teachingRepository.findOne({
    where: { teacher },
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
    return await teachingRepository.save(_teaching);
  }
  return existingTeaching;
}

export async function deleteTeaching(teaching: Teaching): Promise<void> {
  await teachingRepository.remove(teaching);
}
