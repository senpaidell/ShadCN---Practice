import { Request, Response } from "express";
import { Item, ItemSchemaZod } from "../models/Items";

//ITEMS TABLE
export const createItem = async(
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validatedItemData = ItemSchemaZod.parse(req.body);
        const newItem = await Item.create(validatedItemData);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

//ITEMS TABLE

export const getItems = async(
    req: Request,
    res: Response): Promise<void> => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}