import mongoose, { Schema, Document } from "mongoose";

interface IAuditLog extends Document {
    user: mongoose.Types.ObjectId;
    targetName: string;
    tableName?: string;
    activity: string;
    // NEW: Add the changes object
    changes?: {
        added?: number;
        subtracted?: number;
        field?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetName: {
        type: String,
        required: true,
    },
    tableName: {
        type: String
    },
    activity: {
        type: String,
        required: true,
    },
    // NEW: Define the changes schema for MongoDB
    changes: {
        added: { type: Number },
        subtracted: { type: Number },
        field: { type: String }
    }
},
    {
        timestamps: true
    });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);