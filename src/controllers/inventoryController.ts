import { Request, Response } from "express";
import { InventoryTable, InventoryTableSchemaZod } from "../models/Inventory";
import { Item } from "../models/Items";
import { AuthRequest } from "../middleware/authMiddleware";



//CREATE TABLE
export const createInventoryTable = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const validatedData = InventoryTableSchemaZod.parse(req.body)
        const tableData = {
            ...validatedData,
            user: req.user.id
        }
        const newInventory = await InventoryTable.create(tableData)
        res.status(201).json(newInventory)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

//GET TABLES
// export const getInventoryTable = async(
//     req: AuthRequest,
//     res: Response
// ): Promise<void> => {
//     try {
//         const tables = await InventoryTable.find({user: req.user.id}).sort({ createdAt: -1 })
//         res.status(200).json(tables);
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// }

export const getInventoryTable = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        // 1. Fetch tables and use .lean() to get plain JS objects instead of heavy Mongoose documents
        const tables = await InventoryTable.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

        // 2. Map over the tables and count the items for each one
        const tablesWithCounts = await Promise.all(
            tables.map(async (table) => {
                // Count how many items share this tableId
                const itemCount = await Item.countDocuments({ tableId: table._id, user: req.user.id });

                return {
                    ...table,
                    itemCount // Attach the count to the table object
                };
            })
        );

        // 3. Send the updated array to the frontend
        res.status(200).json(tablesWithCounts);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// GET SINGLE TABLE BY ID
export const getInventoryTableById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const table = await InventoryTable.findById({ _id: id, user: req.user.id });

        if (!table) {
            res.status(404).json({ message: "Table not found" });
            return;
        }

        res.status(200).json(table);
    } catch (error: any) {
        // This catches invalid ObjectIDs
        res.status(400).json({ error: "Invalid Table ID format" });
    }
};

// UPDATE TABLE NAME
export const updateInventoryTable = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === "") {
            res.status(400).json({ message: "Table name is required" });
            return;
        }

        const updatedTable = await InventoryTable.findOneAndUpdate(
            { _id: id as string, user: req.user.id },
            { name },
            { new: true }
        );

        if (!updatedTable) {
            res.status(404).json({ message: "Table not found" });
            return;
        }

        res.status(200).json(updatedTable);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE TABLE AND ITS ITEMS
export const deleteInventoryTable = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        // 1. Delete the table
        const deletedTable = await InventoryTable.findOneAndDelete({ _id: id as string, user: req.user.id });

        if (!deletedTable) {
            res.status(404).json({ message: "Table not found" });
            return;
        }

        // 2. Delete all items associated with this table
        await Item.deleteMany({ tableId: id as string, user: req.user.id });

        res.status(200).json({ message: "Table and associated items deleted successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


