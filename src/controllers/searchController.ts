// controllers/searchController.ts
import { Response } from "express";
import { Item } from "../models/Items";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";

export const globalSearch = async (req: AuthRequest, res: Response) => {
    try {
        const { q } = req.query;

        // If there's no query, just return empty arrays
        if (!q || typeof q !== 'string') {
            res.status(200).json({ tables: [], items: [] });
            return;
        }

        // Create a case-insensitive regex for partial matching
        const searchRegex = new RegExp(q, 'i');

        // Dynamically grab the InventoryTable model 
        // (Assuming 'InventoryTable' is exactly how you named it in mongoose.model)
        const InventoryTable = mongoose.model('InventoryTable');

        // Promise.all runs both database queries simultaneously to cut latency in half
        const [tables, items] = await Promise.all([
            // Search Tables by name
            InventoryTable.find({
                name: searchRegex,
                // user: req.user.id // Uncomment this if tables are tied to specific users!
            }).limit(5).select('name _id'),

            // Search Items by name (scoped strictly to the logged-in user)
            Item.find({
                name: searchRegex,
                user: req.user.id
            }).limit(5).select('name tableId inStock') // Only fetch the fields we need for the dropdown
        ]);

        res.status(200).json({ tables, items });
    } catch (error: any) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "An error occurred during search." });
    }
};