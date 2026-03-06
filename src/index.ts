import dotenv from "dotenv";
dotenv.config(); // 1. Load env vars first!

import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import studentRoutes from "./routes/studentRoutes";
import userRouter from "./routes/userRoutes";
import itemRouter from "./routes/itemRoutes";
import inventoryTableRoutes from "./routes/inventoryRoutes";
import tileItemRouter from "./routes/tileItemRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 2. The "Start" function for immediate feedback
const startServer = async () => {
    try {
        // This ensures the connection is established or retrieved from cache 
        // as soon as the file is executed
        await connectDB(); 
        console.log("✅ MongoDB Connection Attempt Finished");
    } catch (err) {
        console.error("❌ Pre-connection failed:", err);
    }
};

// Execute the connection logic
startServer();

// 3. Keep the safety middleware for Vercel
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

app.get('/', (req: Request, res: Response) => {
    res.json({ message: "Hello from TypeScript Backend on Vercel" });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;