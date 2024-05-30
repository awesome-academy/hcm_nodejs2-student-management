import { In } from "typeorm";
import { checkSemesterStarted, getSemesterData } from "../common/utils";
import { AppDataSource } from "../config/typeorm";
import { CreateScoreDto } from "../dto/score/create-score.dto";
import { UpdateScoreDto } from "../dto/score/update-score.dto";
import { Class } from "../entities/class.entity";
import { ClassScore } from "../entities/class_score.entity";
import { Conduct } from "../entities/conduct.entity";
import { Score } from "../entities/score.entity";
import { Semester } from "../entities/semester.entity";
import { StudentScore } from "../entities/student_score.entity";
import { Subject } from "../entities/subject.entity";
import * as classService from "./class.service";
import * as conductService from "./conduct.service";
import * as semesterService from "./semester.service";

const classScoreRepository = AppDataSource.getRepository(ClassScore);
const studentScoreRepository = AppDataSource.getRepository(StudentScore);
const scoreRepository = AppDataSource.getRepository(Score);

export async function getClassScoreByData(
  class_school: Class,
  subject: Subject,
  semester: Semester
): Promise<ClassScore | null> {
  return await classScoreRepository.findOne({
    where: {
      class_school,
      subject,
      semester,
    },
    loadRelationIds: {
      relations: ["student_scores"],
    },
  });
}

export async function getStudentScore(
  scoreId: number
): Promise<StudentScore | null> {
  return await studentScoreRepository.findOne({
    where: {
      id: scoreId,
    },
    loadRelationIds: { relations: ["semester"] },
  });
}

export async function getScore(scoreId: number): Promise<Score | null> {
  return await scoreRepository.findOne({
    where: {
      id: scoreId,
    },
    relations: {
      student_score: {
        semester: true,
      },
    },
  });
}

export async function getClassScoreDetail(
  class_school: Class,
  subject: Subject,
  semester: Semester
): Promise<ClassScore | null> {
  return await classScoreRepository.findOne({
    where: {
      class_school,
      subject,
      semester,
    },
    relations: {
      class_school: {
        grade: true,
      },
      subject: true,
      semester: true,
      student_scores: {
        student: true,
        scores: true,
      },
    },
    order: {
      student_scores: {
        student: {
          name: "ASC",
        },
      },
    },
  });
}

export async function getStudentScoreboard(
  classId: number,
  semesterName: number,
  studentId: number
): Promise<[Conduct | null, StudentScore[]] | string> {
  const _class = await classService.getClassById(classId);
  if (!_class) return "class.not_exist";
  const semester = await semesterService.getSemesterByData(
    semesterName,
    _class.school_year
  );
  if (!semester) return "semester.not_exist";
  const semesterId = semester.id;
  return await Promise.all([
    conductService.getStudentConduct(studentId, semesterId),
    studentScoreRepository
      .createQueryBuilder("studentScore")
      .innerJoinAndSelect("studentScore.class_score", "classScore")
      .innerJoinAndSelect("classScore.class_school", "classSchool")
      .innerJoinAndSelect("classScore.subject", "subject")
      .innerJoinAndSelect("classScore.semester", "classSemester")
      .innerJoinAndSelect("studentScore.student", "student")
      .innerJoinAndSelect("studentScore.scores", "scores")
      .where("student.id = :studentId", { studentId })
      .andWhere("classSchool.id = :classId", { classId })
      .andWhere("classSemester.id = :semesterId", { semesterId })
      .getMany(),
  ]);
}

export async function createClassScore(
  class_school: Class,
  subject: Subject,
  semester: Semester
): Promise<void> {
  const _class = await classService.getClassDetail(class_school.id);
  if (!_class) return;
  const classScore = classScoreRepository.create({
    class_school: _class,
    subject,
    semester,
  });
  await classScoreRepository.save(classScore);
  const studentScores = _class.students.map((student) => {
    return studentScoreRepository.create({
      class_score: classScore,
      student,
      semester,
    });
  });
  await studentScoreRepository.save(studentScores);
}

export async function deleteClassScore(
  class_school: Class,
  subject: Subject,
  semester: Semester
): Promise<void> {
  const classScore = await getClassScoreByData(class_school, subject, semester);
  if (!classScore) return;
  const existingScores = await scoreRepository.findOne({
    where: { student_score: In(classScore.student_scores) },
  });
  if (existingScores) return;
  await classScoreRepository.remove(classScore);
}

export async function createScore(
  scoreDto: CreateScoreDto
): Promise<void | string> {
  const studentScore = await getStudentScore(scoreDto.student_score);
  if (!studentScore) return "score.not_exist";
  const semester = await semesterService.getSemesterById(
    studentScore.semester.id
  );
  if (!semester) return "semester.not_exist";
  const { startMonth, endMonth, year } = getSemesterData(semester);
  if (
    !checkSemesterStarted(startMonth, year) ||
    checkSemesterStarted(endMonth + 1, year)
  )
    return "score.invalid_time";
  const score = scoreRepository.create({
    ...scoreDto,
    student_score: studentScore,
  });
  await scoreRepository.save(score);
}

export async function updateScore(
  id: number,
  scoreDto: UpdateScoreDto
): Promise<void | string> {
  const _score = await getScore(id);
  if (!_score) return "score.not_exist";
  const semester = await semesterService.getSemesterById(
    _score.student_score.semester.id
  );
  if (!semester) return "semester.not_exist";
  const { startMonth, endMonth, year } = getSemesterData(semester);
  if (
    !checkSemesterStarted(startMonth, year) ||
    checkSemesterStarted(endMonth + 1, year)
  )
    return "score.invalid_time";
  _score.score = scoreDto.score;
  await scoreRepository.save(_score);
}
