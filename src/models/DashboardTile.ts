import mongoose from "mongoose";

const DashboardTileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryTable',
        required: true
    }
})

export const DashboardTile = mongoose.models.DashboardTile ||mongoose.model("DashboardTile", DashboardTileSchema)