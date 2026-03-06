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

//UPDATED CREATE ITEM 
export const addItemToTable = async (req: AuthRequest, res: Response) => {
    try {
        const {
            tableId,
            name,
            volume,
            inStock,
            newStock,
            expiration,
        } = req.body;

        const numericInStock = Number(inStock) || 0;
        const numericNewStock = Number(newStock) || 0;
        const numericVolume = Number(volume) || 0;

        const totalStock = numericInStock + numericNewStock;
        const calculatedBalance = totalStock > 0 ? (numericInStock / totalStock) * 100 : 0;

        const itemData: any = {
            tableId,
            name,
            volume: numericVolume,
            inStock: numericInStock,
            newStock: numericNewStock,
            balance: Math.round(calculatedBalance * 100) / 100,
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
        const items = await Item.find({ tableId: id as string, user: req.user.id});
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
        const { name, volume, inStock, newStock, expiration } = req.body;

        const numericInStock = Number(inStock) || 0;
        const numericNewStock = Number(newStock) || 0;
        const numericVolume = Number(volume) || 0;

        const totalStock = numericInStock + numericNewStock;
        const calculatedBalance = totalStock > 0 ? (numericInStock / totalStock) * 100 : 0;

        const updateData: any = {
            name,
            volume: numericVolume,
            inStock: numericInStock,
            newStock: numericNewStock,
            balance: Math.round(calculatedBalance * 100) / 100,
        };

        if (expiration) {
            updateData.expiration = new Date(expiration);
        }

        const updatedItem = await Item.findOneAndUpdate(
            { _id: id as string, user: req.user.id },
            updateData,
            { new: true } // Returns the updated document
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