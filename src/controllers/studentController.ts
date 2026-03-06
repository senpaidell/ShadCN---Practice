import { Request, Response } from "express";
import { Student, StudentSchemaZod } from "../models/Student";

//STUDENT (SAMPLE)
export const createStudent = async (req: Request, res: Response): Promise<void> => {
    try{
        const validatedData = StudentSchemaZod.parse(req.body);
        const newStudent = await Student.create(validatedData);
        res.status(201).json(newStudent);
    } catch (error :any){   
        res.status(400).json({ error: error.message });
    }
};

//STUDENT (SAMPLE)
export const getStudents = async (req: Request, res: Response): Promise<void> => {
    try{
        const students = await Student.find().sort({createdAt: -1});
        res.status(200).json(students);
    } catch (error :any){
        res.status(400).json({message: error.message});
    }
}
