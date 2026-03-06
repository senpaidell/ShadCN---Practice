import { Router } from "express";
import { createTileItem, getTileItem } from "../controllers/tileController";
const tileItemRouter = Router();
import { protectRoute } from "../middleware/authMiddleware";

tileItemRouter.post('/', protectRoute, createTileItem);
tileItemRouter.get('/', protectRoute, getTileItem);

export default tileItemRouter;