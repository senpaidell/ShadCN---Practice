import mongoose, { Schema, Document } from "mongoose";

interface IItem extends Document {
    tableId: mongoose.Types.ObjectId;
    name: string;
    volume?: number;
    currentStock: number;
    parLevel: number;
    expiration?: Date;
    user: mongoose.Types.ObjectId;
}

// 2. Define the Schema (Flat structure)
const ItemSchema = new Schema<IItem>({
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'InventoryTable',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    volume: {
        type: Number,
        default: 0
    },
    currentStock: {
        type: Number,
        default: 0
    },
    parLevel: {
        type: Number,
        default: 0
    },
    expiration: {
        type: Date
    }
},
    {
        timestamps: true
    });

export const Item = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);