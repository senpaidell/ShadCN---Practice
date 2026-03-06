import { Router } from "express";
import { createInventoryTable, getInventoryTable, getInventoryTableById, updateInventoryTable, deleteInventoryTable } from "../controllers/inventoryController";
import { protectRoute } from "../middleware/authMiddleware";

const inventoryTableRoutes = Router()

// /api/tables
inventoryTableRoutes.post('/', protectRoute, createInventoryTable)
inventoryTableRoutes.get('/', protectRoute, getInventoryTable)
inventoryTableRoutes.get("/:id", protectRoute, getInventoryTableById);

inventoryTableRoutes.patch("/:id", protectRoute, updateInventoryTable);
inventoryTableRoutes.delete("/:id", protectRoute, deleteInventoryTable);

export default inventoryTableRoutes