// routes/searchRoutes.ts
import { Router } from "express";
import { globalSearch } from "../controllers/searchController";
import { protectRoute } from "../middleware/authMiddleware";

const searchRouter = Router();

// This handles GET requests to /api/search?q=...
searchRouter.get('/', protectRoute, globalSearch);

export default searchRouter;