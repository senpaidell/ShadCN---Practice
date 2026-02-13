import { Router } from "express";
import {
    createStudent,
    getStudents,
} from "../controllers/studentController";

const router = Router();

//STUDENT (SAMPLE)
router.post('/', createStudent);
router.get('/', getStudents);

export default router;