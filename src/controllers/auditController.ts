import { AuditLog } from "../models/AuditLog";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE AUDIT LOG
export const createAuditLog = async (req: AuthRequest, res: Response) => {
    try {
        // NEW: Destructure 'changes' from req.body
        const { targetName, activity, tableName, changes } = req.body;

        if (!targetName || !activity) {
            return res.status(400).json({ error: "Target name and activity are required" });
        }

        const newAuditLog = await AuditLog.create({
            user: req.user.id,
            targetName,
            tableName,
            activity,
            changes // NEW: Pass it into the creation method
        });

        res.status(201).json(newAuditLog);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// GET ALL AUDIT LOGS
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch logs, sort by newest first, and populate the user's email
        const auditLogs = await AuditLog.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate("user", "email")
            .exec();

        res.status(200).json(auditLogs);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};