import { Router } from "express";
import { createTileItem, getTileItem, deleteTileItem } from "../controllers/tileController";
const tileItemRouter = Router();
import { protectRoute } from "../middleware/authMiddleware";

tileItemRouter.post('/', protectRoute, createTileItem);
tileItemRouter.get('/', protectRoute, getTileItem);
tileItemRouter.delete('/:id', protectRoute, deleteTileItem);

export default tileItemRouter;