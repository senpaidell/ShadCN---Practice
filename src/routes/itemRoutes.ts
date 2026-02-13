import { Router } from "express";
import { getItems, createItem } from "../controllers/itemController";

const itemRouter = Router();

//ITEM (ACTUAL)

itemRouter.post('/', createItem);
itemRouter.get('/', getItems);

export default itemRouter;

