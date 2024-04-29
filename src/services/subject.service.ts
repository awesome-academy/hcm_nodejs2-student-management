import { In } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import { Grade } from "../entities/grade.entity";
import { Subject } from "../entities/subject.entity";

const subjectRepository = AppDataSource.getRepository(Subject);
const gradeRepository = AppDataSource.getRepository(Grade);

export async function getSubjects(): Promise<Subject[]> {
  return await subjectRepository.find({
    loadRelationIds: { relations: ["grades"] },
  });
}

export async function getSubjectsById(ids: number[]): Promise<Subject[]> {
  return await subjectRepository.find({
    where: { id: In(ids) },
  });
}

export async function createSubject(
  name: string,
  grades: number[]
): Promise<void> {
  const existingGrades = await gradeRepository.find({
    where: { id: In(grades) },
    relations: ["subjects"],
  });
  const _subject = subjectRepository.create({ name, grades: existingGrades });
  const subject = await subjectRepository.save(_subject);
  await Promise.all(
    existingGrades.map(async (grade) => {
      if (!grade.subjects) grade.subjects = [subject];
      else grade.subjects.push(subject);
      await gradeRepository.save(grade);
    })
  );
}

export async function updateSubject(
  id: number,
  name: string,
  grades: number[]
): Promise<void> {
  const subject = await subjectRepository.findOne({
    where: { id },
    loadRelationIds: { relations: ["grades"] },
  });
  if (!subject) return;
  const oldGrades = await gradeRepository.find({
    where: { id: In(subject.grades) },
    relations: ["subjects"],
  });
  await Promise.all(
    oldGrades.map(async (grade) => {
      grade.subjects = grade.subjects.filter((subject) => subject.id !== id);
      await gradeRepository.save(grade);
    })
  );
  const existingGrades = await gradeRepository.find({
    where: { id: In(grades) },
    relations: ["subjects"],
  });
  subject.name = name;
  subject.grades = existingGrades;
  await subjectRepository.save(subject);
  await Promise.all(
    existingGrades.map(async (grade) => {
      if (!grade.subjects) grade.subjects = [subject];
      else grade.subjects.push(subject);
      await gradeRepository.save(grade);
    })
  );
}

export async function isExistingSubject(
  name: string,
  id?: number
): Promise<boolean> {
  const existingSubject = await subjectRepository.findOne({
    where: { name },
  });
  if (existingSubject && existingSubject.id !== id) return true;
  return false;
}

export async function deleteSubject(id: number): Promise<void | string> {
  const subject = await subjectRepository.findOne({
    where: { id },
    loadRelationIds: { relations: ["grades", "teachers", "teachings"] },
  });
  if (!subject) return;
  if (subject.teachings.length > 0) return "subject.existing_teachings";
  if (subject.teachers.length > 0) return "subject.existing_teachers";
  const grades = await gradeRepository.find({
    where: { id: In(subject.grades) },
    relations: ["subjects"],
  });

  await Promise.all(
    grades.map(async (grade) => {
      grade.subjects = grade.subjects.filter((subject) => subject.id !== id);
      await gradeRepository.save(grade);
    })
  );
  await subjectRepository.remove(subject);
}
