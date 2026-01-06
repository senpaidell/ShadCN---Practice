import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

export const StudentSchemaZod = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    age: z.number().min(16, "Student must be at least 16 years old"),
    course: z.string().min(2, "Course name is required"),
});

export type StudentType = z.infer<typeof StudentSchemaZod>;

interface IStudentModel extends StudentType, Document {}

const StudentSchema = new Schema(
    {
        name: { type: String, required: true},
        email: { type: String, required: true, unique: true},
        age: {type: Number, required: true},
        course: { type: String, required: true},
    },
    {
        timestamps: true,
    }
);

export const Student = mongoose.model<IStudentModel>("Student", StudentSchema);