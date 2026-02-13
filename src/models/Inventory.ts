import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

export const InventoryTableSchemaZod = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    attributes: z.array(z.string()).min(1, "Must select at least one attribute")
})

export type InventoryTableType = z.infer<typeof InventoryTableSchemaZod>

interface IInventoryTableModel extends InventoryTableType, Document { }

const InventoryTableSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        attributes: {
            type: [String],
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

export const InventoryTable = mongoose.model<IInventoryTableModel>("InventoryTable", InventoryTableSchema)