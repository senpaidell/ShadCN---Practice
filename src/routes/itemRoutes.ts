// routes/itemRoutes.ts
import { Router } from "express";
import {
    getItemsByTable,
    addItemToTable,
    updateItem,
    deleteItem,
    getDashboardItems,
    getReportData,
    updateItemStock// <-- Import the new function
} from "../controllers/itemController";
import { protectRoute } from "../middleware/authMiddleware";

const itemRouter = Router();

itemRouter.post('/', protectRoute, addItemToTable);
itemRouter.get('/dashboard', protectRoute, getDashboardItems);

// NEW: Report Route (MUST go before /:id)
itemRouter.get('/report/:id', protectRoute, getReportData);

// Existing Routes
itemRouter.get('/:id', protectRoute, getItemsByTable);
itemRouter.patch('/:id', protectRoute, updateItem);
itemRouter.delete('/:id', protectRoute, deleteItem);
itemRouter.patch('/:id/stock', protectRoute, updateItemStock);

export default itemRouter;