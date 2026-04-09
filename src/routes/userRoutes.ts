import { Router } from "express";
// Added the new functions to the import list
import { signupUser, verifySignup, loginUser, forgotPassword, resetPassword, getUsers, changePassword, updateProfile, requestPasswordChangeOTP, verifyPasswordChange } from "../controllers/userController";
import { protectRoute } from "../middleware/authMiddleware";
const userRouter = Router();

// ... existing routes ...
userRouter.post("/signup", signupUser);
userRouter.post("/verify", verifySignup);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/getusers", protectRoute, getUsers);
userRouter.post("/change-password", protectRoute, changePassword);

// --- ADD THESE NEW ROUTES ---
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.post("/request-password-change", protectRoute, requestPasswordChangeOTP);
userRouter.post("/verify-password-change", protectRoute, verifyPasswordChange);

export default userRouter;