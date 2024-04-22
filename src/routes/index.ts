import { Router } from "express";
import authRoute from "./auth.route";
import classRoute from "./class.route";
import gradeRoute from "./grade.route";
import scheduleRoute from "./schedule.route";
import studentRoute from "./student.route";
import subjectRoute from "./subject.route";
import teacherRoute from "./teacher.route";
const router: Router = Router();

router.use("/auth", authRoute);
router.use("/classes", classRoute);
router.use("/grades", gradeRoute);
router.use("/schedules", scheduleRoute);
router.use("/students", studentRoute);
router.use("/subjects", subjectRoute);
router.use("/teachers", teacherRoute);

export default router;
