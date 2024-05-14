import { In } from "typeorm";
import { AppDataSource } from "../config/typeorm";
import { Subject } from "../entities/subject.entity";
import * as gradeService from "./grade.service";

const subjectRepository = AppDataSource.getRepository(Subject);

export async function getSubjects(): Promise<Subject[]> {
  return await subjectRepository.find({
    loadRelationIds: { relations: ["grades"] },
  });
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return await subjectRepository.findOne({
    where: { id },
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
  const existingGrades = await gradeService.getGradesById(grades);
  const _subject = subjectRepository.create({ name, grades: existingGrades });
  await subjectRepository.save(_subject);
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
  const existingGrades = await gradeService.getGradesById(grades);
  subject.name = name;
  subject.grades = existingGrades;
  await subjectRepository.save(subject);
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
  await subjectRepository.remove(subject);
}
