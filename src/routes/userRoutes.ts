import { Router } from "express";
// Added the new functions to the import list
import { updateProfilePicture, signupUser, verifySignup, loginUser, forgotPassword, resetPassword, getUsers, changePassword, updateProfile, requestPasswordChangeOTP, verifyPasswordChange } from "../controllers/userController";
import { protectRoute } from "../middleware/authMiddleware";
import multer from "multer";
const userRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
userRouter.put("/update-profile-picture", protectRoute, upload.single("image"), updateProfilePicture);

export default userRouter;