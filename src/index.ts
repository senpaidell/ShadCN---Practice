import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import studentRoutes from "./routes/studentRoutes";
import userRouter from "./routes/userRoutes";
import itemRouter from "./routes/itemRoutes";
import inventoryTableRoutes from "./routes/inventoryRoutes";
import tileItemRouter from "./routes/tileItemRoutes";
import auditRouter from "./routes/auditRoutes";
import searchRoutes from "./routes/searchRoutes";
import mongoose from "mongoose";

const app = express();

const corsOptions = {
    origin: [
        'https://cosh-inventory.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credetials: true,
}

app.use(cors(corsOptions));
app.use(express.json());

const startServer = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connection Attempt Finished");
    } catch (err) {
        console.error("Pre-connection failed:", err);
    }
};

startServer();

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/users", userRouter);
app.use("/api/tables", inventoryTableRoutes);
app.use("/api/items", itemRouter);
app.use("/api/tileItems", tileItemRouter);
app.use("/api/audits", auditRouter);
app.use("/api/search", searchRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: "Hello from TypeScript Backend on Vercel" });
});

app.get('/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
        status: 'UP',
        uptime: process.uptime(),
        database: isDbConnected ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    })
})

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

export default app;