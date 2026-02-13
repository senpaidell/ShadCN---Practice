import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import studentRoutes from "./routes/studentRoutes"
import userRoutes from "./routes/userRoutes";
import itemRouter from "./routes/itemRoutes";
import inventoryTableRoutes from "./routes/inventoryRoutes";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.port || 5000;

//Middleware
app.use(cors());
app.use(express.json());
app.use("/api/students", studentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRouter);
app.use("/api/tables", inventoryTableRoutes)

app.get('/', (req: Request, res: Response) => {
    res.json({message: "Hello from TypeScript Backend"});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost: ${PORT}`);
});