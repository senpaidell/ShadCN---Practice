import { Router } from "express";
import { signupUser, verifySignup, loginUser, forgotPassword, resetPassword, getUsers} from "../controllers/userController";
import { protectRoute } from "../middleware/authMiddleware";
const userRouter = Router();

//USER (ACTUAL)

userRouter.post("/signup", signupUser);
userRouter.post("/verify", verifySignup);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/getusers", protectRoute, getUsers);

export default userRouter;