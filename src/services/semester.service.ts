import { SemesterNames } from "../common/constants";
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

export async function createSemesters(
  school_year: string
): Promise<Semester[]> {
  const firstSemester = semesterRepository.create({
    name: SemesterNames.FIRST,
    school_year,
  });
  const secondSemester = semesterRepository.create({
    name: SemesterNames.SECOND,
    school_year,
  });
  return await semesterRepository.save([firstSemester, secondSemester]);
}

export async function getSemestersByYear(
  school_year: string
): Promise<Semester[]> {
  return await semesterRepository.find({
    where: { school_year },
  });
}

export async function getSemesterById(id: number): Promise<Semester | null> {
  return await semesterRepository.findOne({
    where: { id },
  });
}

export async function getSemesterByData(
  name: number,
  school_year: string
): Promise<Semester | null> {
  return await semesterRepository.findOne({
    where: { school_year, name },
  });
}
