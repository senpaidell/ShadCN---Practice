// controllers/searchController.ts
import { Response } from "express";
import { Item } from "../models/Items";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";

export const globalSearch = async (req: AuthRequest, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(200).json({ tables: [], items: [] });
            return;
        }

        const searchRegex = new RegExp(q, 'i');

        const InventoryTable = mongoose.model('InventoryTable');

        const [tables, items] = await Promise.all([
            InventoryTable.find({
                name: searchRegex,
                user: req.user.id
            }).limit(5).select('name _id'),

            Item.find({
                name: searchRegex,
                user: req.user.id
            } as any).limit(5).populate(
                {
                    path: 'tableId',
                    model: 'InventoryTable',
                    select: 'name'
                }
            ).select('name tableId currentStock')
        ]);

        res.status(200).json({ tables, items });
    } catch (error: any) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "An error occurred during search." });
    }
};