import mongoose, { Document, Schema } from "mongoose";
import { number, z } from "zod";

export const ItemSchemaZod = z.object({
    itemName: z.string().min(3, "Item name must be at least 3 characters"),
    quantity: z.number().min(1, "Quantity shouldn't be left out"),
    unit: z.string().min(3, "Unit must be at least 3 characters"),
    reOrderLevel: z.number().min(1, "Minimum of one character"),
    price: z.number().min(1, "Minimum of one character"),
    expirationDate: z.string(),
    image: z.string()
})

export type ItemType = z.infer<typeof ItemSchemaZod>

interface IItemModel extends ItemType, Document { }

const ItemSchema = new Schema(
    {
        itemName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            required: true
        },
        reOrderLevel: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        expirationDate: {
            type: String,
            required: true
        },
        image: {
            type: String,
        }
    }
)

export const Item = mongoose.model<IItemModel>("Item", ItemSchema);