export enum AccountRoles {
  STAFF = 1,
  TEACHER = 2,
  STUDENT = 3,
}

export enum Genders {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}

export enum SemesterNames {
  FIRST = 1,
  SECOND = 2,
}

export enum ClassStatus {
  ACTIVE = 1,
  NON_ACTIVE = 2,
}

export enum TeacherStatus {
  ACTIVE = 1,
  NON_ACTIVE = 2,
}

export enum StudentStatus {
  ACTIVE = 1,
  NON_ACTIVE = 2,
}

export enum ScoreFactors {
  SINGLE = 1,
  DOUBLE = 2,
  TRIPLE = 3,
}

export enum Periods {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH = 5,
  SIXTH = 6,
  SEVENTH = 7,
  EIGHTH = 8,
  NINETH = 9,
  TENTH = 10,
}

export enum Days {
  MON = 1,
  TUE = 2,
  WED = 3,
  THUS = 4,
  FRI = 5,
  SAT = 6,
}

export enum EducationLevels {
  SECONDARY = 1,
  HIGH = 2,
}

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export const MAX_LENGTH_30 = 30;
export const MAX_LENGTH_50 = 50;
export const MAX_LENGTH_100 = 100;
export const DEFAULT_SECRET = "secret";
export const TOKEN_EXPIRE = "2h";

export const SECONDARY_GRADES = [6, 7, 8, 9];
export const HIGH_GRADES = [10, 11, 12];

//The first semester will be from September (9) to December (12)
//The second semester will be from January (1) to May (5)
export const START_MONTH_FS = 9;
export const END_MONTH_FS = 12;
export const START_MONTH_SS = 1;
export const END_MONTH_SS = 5;
