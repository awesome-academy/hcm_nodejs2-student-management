import { In } from "typeorm";
import { checkSemesterStarted, getSemesterData } from "../common/utils";
import { AppDataSource } from "../config/typeorm";
import { UpdateConductDto } from "../dto/student/update-conduct.dto";
import { Conduct } from "../entities/conduct.entity";
import { Semester } from "../entities/semester.entity";
import { Student } from "../entities/student.entity";
import * as classService from "./class.service";
import * as semesterService from "./semester.service";
import * as studentService from "./student.service";

const conductRepository = AppDataSource.getRepository(Conduct);

export async function createConducts(
  students: Student[],
  semesters: Semester[]
): Promise<void> {
  await Promise.all(
    students.map((student) => {
      return Promise.all(
        semesters.map((semester) => {
          const conduct = conductRepository.create({
            student,
            semester,
          });
          return conductRepository.save(conduct);
        })
      );
    })
  );
}

export async function getConductsByData(
  studentIds: number[],
  semesters: Semester[]
): Promise<Conduct[]> {
  return await conductRepository.find({
    where: {
      student: {
        id: In(studentIds),
      },
      semester: In(semesters),
    },
  });
}

export async function updateConduct(
  studentId: number,
  conductDto: UpdateConductDto,
  teacherId: number
): Promise<void | string> {
  const { class_id, conduct, semester_id } = { ...conductDto };
  const student = await studentService.getStudentById(studentId);
  if (!student) return "student.not_exist";
  const _class = await classService.getClassById(class_id);
  if (!_class) return "class.not_exist";
  if (+_class.teacher !== teacherId) return "teacher.unauthorized";
  const _semester = await semesterService.getSemesterById(semester_id);
  if (!_semester) return "semester.not_exist";
  const { endMonth, year } = getSemesterData(_semester);
  const isSemesterEnded = checkSemesterStarted(endMonth, year);
  if (isSemesterEnded) return "semester.finished";
  const existingConduct = await conductRepository.findOne({
    where: {
      student: { id: studentId },
      semester: { id: semester_id },
    },
  });
  if (!existingConduct) return "conduct.not_found";
  existingConduct.type = conduct;
  await conductRepository.save(existingConduct);
}

export async function deleteConducts(conducts: Conduct[]): Promise<void> {
  await conductRepository.remove(conducts);
}
