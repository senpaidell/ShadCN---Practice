import mongoose, {Document, Schema} from "mongoose";
import { z } from "zod";

export const UserSchemaZod = z.object({
    firstName: z.string().min(3, "Name must be at least 3 characters"),
    lastName: z.string().min(3, "Name must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type UserType = z.infer<typeof UserSchemaZod>

interface IUserModel extends UserType, Document { }

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
        
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUserModel>("User", UserSchema);
