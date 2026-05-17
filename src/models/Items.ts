import mongoose, { Schema, Document } from "mongoose";

// NEW: Define what a batch looks like
interface IBatch {
    quantity: number;
    expirationDate?: Date;
}

interface IItem extends Document {
    tableId: mongoose.Types.ObjectId;
    name: string;
    category?: string;
    volume?: number;
    volumeUnit?: string;
    currentStock: number;
    parLevel: number;
    expiration?: Date; // Keeping this for backward compatibility
    batches: IBatch[]; // NEW: Array to hold multiple batches
    user: mongoose.Types.ObjectId;
}

const ItemSchema = new Schema<IItem>({
    tableId: { type: Schema.Types.ObjectId, ref: 'InventoryTable', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String, default: "Uncategorized" },
    volume: { type: Number, default: 0 },
    volumeUnit: { type: String, default: "" },
    currentStock: { type: Number, default: 0 },
    parLevel: { type: Number, default: 0 },
    expiration: { type: Date },
    // NEW: Default to an empty array so old items don't break
    batches: { type: [{ quantity: Number, expirationDate: Date }], default: [] }
}, { timestamps: true });

export const Item =
    (mongoose.models.Item as mongoose.Model<IItem>) ||
    mongoose.model<IItem>("Item", ItemSchema);