import { Request, Response } from "express";
import { User, UserSchemaZod } from "../models/User";

//USERS TABLE
export const createUser = async(
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validatedUserData = UserSchemaZod.parse(req.body);
        const newUser = await User.create(validatedUserData);
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

//USERS TABLE
export const getUsers = async(
    req: Request,
    res: Response): Promise<void> => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
    
}