import { Between, In, Not } from "typeorm";
import { checkSemesterStarted, getSemesterData } from "../common/utils";
import { AppDataSource } from "../config/typeorm";
import { CreateScheduleDto } from "../dto/schedule/create-schedule.dto";
import { DeleteScheduleDto } from "../dto/schedule/delete-schedule.dto";
import { UpdateScheduleDto } from "../dto/schedule/update-schedule.dto";
import { Class } from "../entities/class.entity";
import { ClassSchedule } from "../entities/class_schedule.entity";
import { PeriodSchedule } from "../entities/period_schedule.entity";
import { Schedule } from "../entities/schedule.entity";
import { Semester } from "../entities/semester.entity";
import * as classService from "./class.service";
import * as semesterService from "./semester.service";
import * as subjectService from "./subject.service";
import * as teacherService from "./teacher.service";
import * as teachingService from "./teaching.service";

const scheduleRepository = AppDataSource.getRepository(Schedule);
const periodScheduleRepository = AppDataSource.getRepository(PeriodSchedule);
const classScheduleRepository = AppDataSource.getRepository(ClassSchedule);

export async function getSchedules(
  classId: number,
  semester: number
): Promise<ClassSchedule | string> {
  const _class = await classService.getClassById(classId);
  if (!_class) return "class.not_found";
  const _semester = await semesterService.getSemesterByData(
    semester,
    _class.school_year
  );
  if (!_semester) return "semester.not_found";
  const schedule = await classScheduleRepository.findOne({
    where: { class_school: _class, semester: _semester },
    relations: {
      period_schedules: {
        schedules: {
          teacher: true,
          subject: true,
        },
      },
      class_school: true,
      semester: true,
    },
    order: {
      period_schedules: {
        period: "ASC",
      },
    },
    select: {
      id: true,
      class_school: {
        id: true,
      },
      semester: {
        id: true,
        name: true,
        school_year: true,
      },
      period_schedules: {
        id: true,
        period: true,
        schedules: {
          id: true,
          teacher: {
            id: true,
            name: true,
          },
          subject: {
            id: true,
            name: true,
          },
          day: true,
        },
      },
    },
  });
  if (!schedule) return "schedule.not_found";
  return schedule;
}

export async function getExistingSchedules(
  semester: Semester,
  day: number,
  start: number,
  end: number
): Promise<Schedule[]> {
  return await scheduleRepository.find({
    where: {
      semester,
      day,
      period_schedule: {
        period: Between(start, end),
      },
    },
    relations: ["teacher"],
  });
}

export async function getTeacherSchedule(
  semester: Semester,
  day: number,
  start: number,
  end: number,
  teacherId: number
): Promise<Schedule | null> {
  return await scheduleRepository.findOne({
    where: {
      semester,
      day,
      period_schedule: {
        period: Between(start, end),
      },
      teacher: {
        id: teacherId,
      },
    },
  });
}

export async function getTeacherSchedules(
  year: string,
  semesterName: number,
  teacherId: number
) {
  const semester = await semesterService.getSemesterByData(semesterName, year);
  if (!semester) return null;
  const schedules = await scheduleRepository.find({
    where: {
      teacher: { id: teacherId },
      semester: { id: semester.id },
    },
    relations: ["period_schedule", "subject", "class_school"],
    order: {
      period_schedule: {
        period: "ASC",
      },
      day: "ASC",
    },
  });

  // Initialize an array of objects for the periods
  const periodScheduleArray: { period: number; schedules: Schedule[] }[] =
    Array.from({ length: 10 }, (_, i) => ({
      period: i + 1,
      schedules: [],
    }));

  schedules.forEach((schedule) => {
    const period = schedule.period_schedule.period;
    periodScheduleArray[period - 1].schedules.push(schedule);
  });

  return periodScheduleArray;
}

export async function createClassSchedule(
  class_school: Class,
  semesters: Semester[]
) {
  const _schedules = semesters.map((semester) =>
    classScheduleRepository.create({
      class_school,
      semester,
      period_schedules: [],
    })
  );
  const schedules = await classScheduleRepository.save(_schedules);
  let promises;
  for (let i = 1; i <= 10; i++) {
    promises = schedules.map(async (schedule) => {
      const period_schedule = periodScheduleRepository.create({
        period: i,
        class_schedule: schedule,
      });
      periodScheduleRepository.save(period_schedule);
      return schedule;
    });
  }
  await Promise.all([promises]);
}

export async function createSchedule(
  scheduleDto: CreateScheduleDto
): Promise<void | string> {
  const { semester, subject, _class, day, startPeriod, endPeriod, teacher } = {
    ...scheduleDto,
  };
  const _semester = await semesterService.getSemesterById(semester);
  if (!_semester) return "semester.not_exist";
  const { startMonth, year } = getSemesterData(_semester);
  const isSemesterStarted = checkSemesterStarted(startMonth, year);
  if (isSemesterStarted) return "semester.started";
  const _subject = await subjectService.getSubjectById(subject);
  if (!_subject) return "subject.not_exist";
  const existingClass = await classService.getClassById(_class);
  if (!existingClass) return "class.not_exist";
  if (startPeriod > endPeriod) return "period.invalid";
  const _teacher = await teacherService.getTeacherById(teacher);
  if (!_teacher) return "teacher.not_exist";
  const existingSchedule = await scheduleRepository.findOne({
    where: {
      class_school: existingClass,
      semester: _semester,
      day,
      period_schedule: {
        period: Between(startPeriod, endPeriod),
      },
    },
  });
  if (existingSchedule) return "schedule.conflict";
  const classSchedule = await classScheduleRepository.findOne({
    where: {
      class_school: existingClass,
      semester: _semester,
    },
  });
  if (!classSchedule) return "schedule.not_exist";
  const teaching = await teachingService.createTeaching(
    _teacher,
    _subject,
    existingClass,
    _semester
  );
  for (let i = startPeriod; i <= endPeriod; i++) {
    const period_schedule = await periodScheduleRepository.findOne({
      where: {
        class_schedule: classSchedule,
        period: i,
      },
    });
    if (!period_schedule) return "schedule.not_exist";
    const _schedule = scheduleRepository.create({
      period_schedule,
      subject: _subject,
      teacher: _teacher,
      class_school: existingClass,
      semester: _semester,
      day,
      teaching,
    });
    scheduleRepository.save(_schedule);
  }
}

export async function updateSchedule(
  scheduleDto: UpdateScheduleDto
): Promise<void | string> {
  const {
    semester,
    subject,
    _class,
    day,
    startPeriod,
    endPeriod,
    teacher,
    oldEndPeriod,
  } = {
    ...scheduleDto,
  };
  const _semester = await semesterService.getSemesterById(semester);
  if (!_semester) return "semester.not_exist";
  const { startMonth, endMonth, year } = getSemesterData(_semester);
  let isCurrentSemester = false;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  if (currentYear > year) {
    return "semester.finished";
  } else if (currentYear == year) {
    if (currentMonth > endMonth) return "semester.finished";
    else if (currentMonth >= startMonth && currentMonth <= endMonth)
      isCurrentSemester = true;
  }
  const _subject = await subjectService.getSubjectById(subject);
  if (!_subject) return "subject.not_exist";
  const existingClass = await classService.getClassById(_class);
  if (!existingClass) return "class.not_exist";
  if (startPeriod > endPeriod) return "period.invalid";
  const _teacher = await teacherService.getTeacherById(teacher);
  if (!_teacher) return "teacher.not_exist";
  if (!_teacher.subjects.map(Number).includes(_subject.id))
    return "teacher.invalid";

  const oldSchedules = await scheduleRepository.find({
    where: {
      class_school: existingClass,
      semester: _semester,
      day,
      period_schedule: {
        period: Between(startPeriod, oldEndPeriod),
      },
    },
    loadRelationIds: {
      relations: ["subject", "teacher"],
    },
  });
  if (oldSchedules.length <= 0) return "schedule.not_found";
  const oldScheduleIds = oldSchedules.map((schedule) => schedule.id);
  const otherSchedule = await scheduleRepository.findOne({
    where: {
      class_school: existingClass,
      semester: _semester,
      subject: {
        id: +oldSchedules[0].subject,
      },
      teacher: {
        id: +oldSchedules[0].teacher,
      },
      id: Not(In(oldScheduleIds)),
    },
  });
  if (
    !otherSchedule &&
    (+oldSchedules[0].subject !== _subject.id ||
      +oldSchedules[0].teacher !== _teacher.id)
  ) {
    const teaching = await teachingService.getExistingTeaching(
      +oldSchedules[0].teacher,
      +oldSchedules[0].subject,
      existingClass.id,
      _semester.id
    );
    if (!teaching) return "schedule.teaching_not_exist";
    await teachingService.deleteTeaching(teaching);
  }
  const newTeaching = await teachingService.createTeaching(
    _teacher,
    _subject,
    existingClass,
    _semester
  );
  if (isCurrentSemester) {
    if (+oldSchedules[0].subject !== _subject.id)
      return "schedule.update_subject_forbidden";
    await Promise.all(
      oldSchedules.map(async (schedule) => {
        schedule.teacher = _teacher;
        schedule.subject = _subject;
        schedule.teaching = newTeaching;
        scheduleRepository.save(schedule);
      })
    );
  } else {
    const conflictSchedules = await scheduleRepository.find({
      where: {
        period_schedule: {
          period: Between(oldEndPeriod + 1, endPeriod),
        },
        class_school: existingClass,
        semester: _semester,
        day,
      },
      loadRelationIds: {
        relations: ["teacher", "subject"],
      },
    });
    if (conflictSchedules.length > 0) {
      let isConflict = false;
      conflictSchedules.map((schedule) => {
        if (
          +schedule.teacher !== _teacher.id ||
          +schedule.subject !== _subject.id
        )
          isConflict = true;
      });
      if (isConflict) return "schedule.conflict_schedule";
    }
    const classSchedule = await classScheduleRepository.findOne({
      where: {
        class_school: existingClass,
        semester: _semester,
      },
    });
    if (!classSchedule) return "schedule.not_exist";
    for (let i = oldEndPeriod + 1; i <= endPeriod; i++) {
      const period_schedule = await periodScheduleRepository.findOne({
        where: {
          class_schedule: classSchedule,
          period: i,
        },
      });
      if (!period_schedule) return "schedule.not_exist";
      const _schedule = scheduleRepository.create({
        period_schedule,
        subject: _subject,
        teacher: _teacher,
        class_school: existingClass,
        semester: _semester,
        day,
      });
      await scheduleRepository.save(_schedule);
    }
    for (let i = endPeriod + 1; i <= oldEndPeriod; i++) {
      const period_schedule = await periodScheduleRepository.findOne({
        where: {
          class_schedule: classSchedule,
          period: i,
        },
      });
      if (!period_schedule) return "schedule.not_exist";
      const _schedule = await scheduleRepository.findOne({
        where: {
          period_schedule,
          class_school: existingClass,
          semester: _semester,
          day,
        },
      });
      if (!_schedule) return "schedule.not_exist";
      await scheduleRepository.remove(_schedule);
    }
    const end = oldEndPeriod < endPeriod ? oldEndPeriod : endPeriod;
    const schedules = await scheduleRepository.find({
      where: {
        period_schedule: {
          period: Between(startPeriod, end),
        },
        class_school: existingClass,
        semester: _semester,
        day,
      },
    });
    await Promise.all(
      schedules.map(async (s) => {
        s.subject = _subject;
        s.teacher = _teacher;
        s.teaching = newTeaching;
        scheduleRepository.save(s);
      })
    );
  }
  return;
}

export async function deleteSchedule(
  scheduleDto: DeleteScheduleDto
): Promise<void | string> {
  const { semester, _class, day, startPeriod, endPeriod } = {
    ...scheduleDto,
  };
  const _semester = await semesterService.getSemesterById(semester);
  if (!_semester) return "semester.not_exist";
  const existingClass = await classService.getClassById(_class);
  if (!existingClass) return "class.not_exist";
  if (startPeriod > endPeriod) return "period.invalid";
  const { startMonth, year } = getSemesterData(_semester);
  const isSemesterStarted = checkSemesterStarted(startMonth, year);
  if (isSemesterStarted) return "semester.started";
  const oldSchedules = await scheduleRepository.find({
    where: {
      class_school: existingClass,
      semester: _semester,
      day,
      period_schedule: {
        period: Between(startPeriod, endPeriod),
      },
    },
    loadRelationIds: {
      relations: ["subject", "teacher"],
    },
  });
  if (oldSchedules.length <= 0) return "schedule.not_found";
  const oldScheduleIds = oldSchedules.map((schedule) => schedule.id);
  const otherSchedule = await scheduleRepository.findOne({
    where: {
      class_school: existingClass,
      semester: _semester,
      subject: {
        id: +oldSchedules[0].subject,
      },
      teacher: {
        id: +oldSchedules[0].teacher,
      },
      id: Not(In(oldScheduleIds)),
    },
  });
  if (!otherSchedule) {
    const teaching = await teachingService.getExistingTeaching(
      +oldSchedules[0].teacher,
      +oldSchedules[0].subject,
      existingClass.id,
      _semester.id
    );
    if (!teaching) return "schedule.teaching_not_exist";
    await scheduleRepository.remove(oldSchedules);
    await teachingService.deleteTeaching(teaching);
    return;
  }
  await scheduleRepository.remove(oldSchedules);
}
