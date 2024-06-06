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
  const [teacher, staff, student] = await Promise.all([
    teacherRepository.findOneBy({ email }),
    staffRepository.findOneBy({ email }),
    studentRepository.findOneBy({ email }),
  ]);

  const existingUser = [teacher, staff, student].find((user) => user !== null);
  return !!existingUser && existingUser.id !== id;
}
