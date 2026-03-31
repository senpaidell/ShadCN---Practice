import { Item } from "../models/Items"
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

//CREATE ITEM (Saving this for backup)
// export const createItem = async (req: Request, res: Response) => {
//     try {
//         const {
//             tableId, name, values
//         } = req.body

//         const newItem = await Item.create({ tableId, name, values })
//         res.status(201).json(newItem);
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// }

export const addItemToTable = async (req: AuthRequest, res: Response) => {
    try {
        const { tableId, name, volume, currentStock, parLevel, expiration } = req.body;

        const itemData: any = {
            tableId,
            name,
            volume: Number(volume) || 0,
            currentStock: Number(currentStock) || 0,
            parLevel: Number(parLevel) || 0,
            user: req.user.id
        }

        if (expiration) {
            itemData.expiration = new Date(expiration)
        }

        const newItem = await Item.create(itemData);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

//GET ITEM
export const getItemsByTable = async (req: AuthRequest, res: Response) => {
    try {
        // const { tableId } = req.params;
        // if (!tableId) {
        //     return res.status(400).json({error: "Table ID is required"})

        // }
        // const items = await Item.find({tableId})
        const { id } = req.params;
        const items = await Item.find({ tableId: id as string, user: req.user.id });
        res.status(200).json(items)
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

//DASHBOARD TILES GET ITEM
export const getDashboardItems = async (req: AuthRequest, res: Response) => {
    try {
        const { ids } = req.query;
        if (!ids) {
            return res.status(200).json([])
        }

        const tableIds = (ids as string).split(',');

        const items = await Item.find({
            tableId: { $in: tableIds },
            user: req.user.id
        });
        res.status(200).json(items);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// UPDATE ITEM
export const updateItem = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, volume, currentStock, parLevel, expiration } = req.body;

        const updateData: any = {
            name,
            volume: Number(volume) || 0,
            currentStock: Number(currentStock) || 0,
            parLevel: Number(parLevel) || 0,
        };

        if (expiration) {
            updateData.expiration = new Date(expiration);
        }

        const updatedItem = await Item.findOneAndUpdate(
            { _id: id as string, user: req.user.id },
            updateData,
            { new: true }
        );

        if (!updatedItem) {
            res.status(404).json({ message: "Item not found" });
            return;
        }

        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE ITEM
export const deleteItem = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deletedItem = await Item.findOneAndDelete({ _id: id as string, user: req.user.id });

        if (!deletedItem) {
            res.status(404).json({ message: "Item not found" });
            return;
        }

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// GET REPORT DATA
export const getReportData = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'summary', 'expiration', 'restocking'

        let query: any = { tableId: id as string, user: req.user.id };
        let sort: any = {};

        // Apply sorting and filtering based on the report type
        if (type === 'expiration') {
            // Only get items that have an expiration date, sort closest to expiring first
            query.expiration = { $exists: true, $ne: null };
            sort.expiration = 1;
        } else if (type === 'restocking') {
            // Sort by lowest balance first so they appear at the top of the report
            sort.balance = 1;
        } else {
            // Default summary sorting (newest first or alphabetical)
            sort.createdAt = -1;
        }

        const items = await Item.find(query).sort(sort);
        res.status(200).json(items);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateItemStock = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action, quantity } = req.body;

        const item = await Item.findById(id);

        if (!item) return res.status(404).json({ message: "Item not found" });

        const qty = parseInt(quantity) || 1;

        if (action === "in") {
            // Only update currentStock, newStock is gone!
            item.currentStock = (item.currentStock || 0) + qty;
        } else if (action === "out") {
            if ((item.currentStock || 0) < qty) {
                return res.status(400).json({ message: "Not enough stock to deduct this amount." });
            }
            item.currentStock = (item.currentStock || 0) - qty;
        } else {
            return res.status(400).json({ message: "Invalid action type." });
        }

        const updatedItem = await item.save();
        res.status(200).json(updatedItem);

    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ message: "Server error while updating stock" });
    }
};

