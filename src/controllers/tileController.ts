import { Request, Response } from "express";
import { tileItem } from "../models/tileItems";
import { AuthRequest } from "../middleware/authMiddleware";

//CREATE TILE ITEM
export const createTileItem = async (req: AuthRequest, res: Response) => {
    try {
        const {
            itemId, tableId
        } = req.body
        const newTileItem = await tileItem.create({ itemId, tableId, user: req.user.id });
        res.status(201).json(newTileItem);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

}

//GET TILE ITEM AND TABLE IDS
export const getTileItem = async (req: AuthRequest, res: Response) => {
    try {
        const getItemAndTableId = await tileItem.find({ user: req.user.id }).populate('itemId').populate('tableId')
        res.status(200).json(getItemAndTableId)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

//DELETE TILE ITEM
export const deleteTileItem = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const deletedTile = await tileItem.findOneAndDelete({
            _id: id,
            user: req.user.id
        })

        if (!deletedTile) {
            res.status(404).json({ error: "Tile not found" })
            return;
        }
    }
}