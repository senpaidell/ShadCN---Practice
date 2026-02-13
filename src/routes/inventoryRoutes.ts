import { Router } from "express";
import { createInventoryTable, getInventoryTable, getInventoryTableById } from "../controllers/inventoryController";

const inventoryTableRoutes = Router()

// /api/tables
inventoryTableRoutes.post('/', createInventoryTable)
inventoryTableRoutes.get('/', getInventoryTable)
inventoryTableRoutes.get("/:id", getInventoryTableById);

export default inventoryTableRoutes