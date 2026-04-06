import { Request, Response } from "express";
import { User, UserSchemaZod } from "../models/User";
import { sendEmail } from "../utils/emailUtility";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

//SIGN UP
export const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = UserSchemaZod.parse(req.body);

        const existingUser = await User.findOne({
            email: validatedData.email
        });

        if (existingUser) {
            res.status(400).json({ error: "Email already in use" })
            return;
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60000);

        const newUser = await User.create({
            ...validatedData,
            otp,
            otpExpires
        });

        await sendEmail(newUser.email, "Verify your account", `Your OTP is: ${otp}`);
        res.status(201).json({
            message: "Signup successful. Please check your email for the OTP."
        })
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

//VERIFY SIGNUP OTP
export const verifySignup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!user) {
            res.status(400).json({ error: "Invalid or expired OTP" });
            return;
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Account verified! You can now log in." })
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// LOGIN (Returns JWT)
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        if (!user.isVerified) {
            res.status(403).json({ error: "Please verify your email first" });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName } });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

//FORGOT PASSWORD (Generates new OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60000);
        await user.save()

        await sendEmail(user.email, "Password Reset", `Your password reset OTP is: ${otp}`);
        res.status(200).json({ message: "OTP sent to your email" })
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// RESET PASSWORD (Verifies OTP and changes password)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } })

        if (!user) {
            res.status(400).json({ error: "invalid or expired OTP" });
            return;
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.findById(req.user.id).select("firstName lastName")
        res.status(200).json(users)
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Current password is incorrect" });
            return;
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}