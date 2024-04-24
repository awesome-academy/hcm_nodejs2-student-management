import { AppDataSource } from "../config/typeorm";
import { In } from "typeorm";
import { Grade } from "../entities/grade.entity";
import { Class } from "../entities/class.entity";

const gradeRepository = AppDataSource.getRepository(Grade);
const classRepository = AppDataSource.getRepository(Class);

export async function getGrades(): Promise<Grade[]> {
  return await gradeRepository.find({ order: { name: "ASC" } });
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
  const existingClass = await classRepository.findOne({
    where: { grade: { name: In(grades) } },
  });
  if (existingClass) return false;
  const gradesToRemove = await gradeRepository.find({
    where: { name: In(grades) },
  });
  await gradeRepository.remove(gradesToRemove);
}
