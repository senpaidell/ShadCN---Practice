import { Router } from "express";
import { getUsers, createUser } from "../controllers/userController";

const userRouter = Router();

//USER (ACTUAL)

userRouter.post('/', createUser);
userRouter.get('/', getUsers);

export default userRouter;