import { AppDataSource } from "../config/typeorm";
import { In } from "typeorm";
import { Grade } from "../entities/grade.entity";
import * as classService from "./class.service";

const gradeRepository = AppDataSource.getRepository(Grade);

export async function getGrades(): Promise<Grade[]> {
  return await gradeRepository.find({ order: { name: "ASC" } });
}

export async function getGradeById(id: number): Promise<Grade | null> {
  return await gradeRepository.findOne({
    where: { id },
    relations: ["subjects", "classes"],
  });
}

export async function getGradesById(ids: number[]): Promise<Grade[]> {
  return await gradeRepository.find({
    where: { id: In(ids) },
    relations: ["subjects"],
  });
}

export async function createGrades(grades: number[]): Promise<void> {
  const existingGrade = await gradeRepository.findOneBy({ name: In(grades) });
  if (existingGrade) return;
  await Promise.all(
    grades.map((gradeValue) => {
      const grade = gradeRepository.create({ name: gradeValue });
      return gradeRepository.save(grade);
    })
  );
}

export async function deleteGrades(grades: number[]): Promise<void | boolean> {
  const existingClass = await classService.getClassByGrades(grades);
  if (existingClass) return false;
  const gradesToRemove = await gradeRepository.find({
    where: { name: In(grades) },
  });
  await gradeRepository.remove(gradesToRemove);
}
