import { AppDataSource } from "../config/typeorm";
import { Staff } from "../entities/staff.entity";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";

const teacherRepository = AppDataSource.getRepository(Teacher);
const staffRepository = AppDataSource.getRepository(Staff);
const studentRepository = AppDataSource.getRepository(Student);

export async function isExistingEmail(
  email: string,
  id?: number
): Promise<boolean> {
  const existingEmail = await Promise.race([
    teacherRepository.findOneBy({ email }),
    staffRepository.findOneBy({ email }),
    studentRepository.findOneBy({ email }),
  ]);
  return !!existingEmail && existingEmail.id !== id;
}
