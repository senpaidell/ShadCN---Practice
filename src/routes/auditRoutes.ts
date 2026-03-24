import { Router } from "express";
import { createAuditLog, getAuditLogs } from "../controllers/auditController";
import { protectRoute } from "../middleware/authMiddleware";

const auditRouter = Router();

// Create a new log (will be triggered by button listeners on the frontend)
auditRouter.post('/', protectRoute, createAuditLog);

// Fetch logs for the Audit Logs page
auditRouter.get('/', protectRoute, getAuditLogs);

export default auditRouter;