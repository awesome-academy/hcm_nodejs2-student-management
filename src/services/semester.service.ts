import { AppDataSource } from "../config/typeorm";
import { Semester } from "../entities/semester.entity";

const semesterRepository = AppDataSource.getRepository(Semester);

export async function getDistinctSchoolYears(): Promise<string[]> {
  let school_years = await semesterRepository
    .createQueryBuilder()
    .select("DISTINCT semester.school_year", "school_year")
    .from(Semester, "semester")
    .getRawMany();
  return school_years.map((item) => item.school_year);
}

export async function getSemesterById(id: number) : Promise<Semester | null> {
  return await semesterRepository.findOne({
    where: { id },
  });
}

export async function getSemesterByData(name: number, school_year: string) : Promise<Semester | null> {
  return await semesterRepository.findOne({
    where: { school_year, name },
  });
}
