import mongoose, {Document, Schema} from "mongoose";
import { z } from "zod";
import bcrypt from "bcrypt";

export const UserSchemaZod = z.object({
    firstName: z.string().min(3, "Name must be at least 2 characters"),
    lastName: z.string().min(3, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type UserType = z.infer<typeof UserSchemaZod>

interface IUserModel extends UserType, Document {
    isVerified: boolean;
    otp?: string | undefined;
    otpExpires?: Date | undefined;
}

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String
        },
        otpExpires: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

export const User = mongoose.models.User ||mongoose.model<IUserModel>("User", UserSchema);
