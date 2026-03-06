import { Router } from "express";
import { getItemsByTable, addItemToTable, updateItem, deleteItem} from "../controllers/itemController";
import { getDashboardItems } from "../controllers/itemController";
const itemRouter = Router();
import { protectRoute } from "../middleware/authMiddleware";

//ITEM (ACTUAL)

itemRouter.post('/', protectRoute, addItemToTable);
itemRouter.get('/dashboard', protectRoute, getDashboardItems);
itemRouter.get('/:id', protectRoute, getItemsByTable);

itemRouter.patch('/:id', protectRoute, updateItem);
itemRouter.delete('/:id', protectRoute, deleteItem);

export default itemRouter;

