import { Request, Response } from "express";
import { InventoryTable, InventoryTableSchemaZod } from "../models/Inventory";

//CREATE TABLE
export const createInventoryTable = async(
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validatedData = InventoryTableSchemaZod.parse(req.body)
        const newInventory = await InventoryTable.create(validatedData)
        res.status(201).json(newInventory)
    } catch (error: any) {
        res.status(400).json({error: error.message})
    }
}

//GET TABLES
export const getInventoryTable = async(
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const tables = await InventoryTable.find().sort({ createdAt: -1 })
        res.status(200).json(tables);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

// GET SINGLE TABLE BY ID
export const getInventoryTableById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const table = await InventoryTable.findById(id);

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