import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

// FOR BACKUP
// export const InventoryTableSchemaZod = z.object({
//     name: z.string().min(2, "Name must be at least 2 characters"),
//     attributes: z.array(z.object({
//         name: z.string(),
//         datatype: z.enum(["string", "number", "data", "boolean"])
//     })).min(1)
// })

// export type InventoryTableType = z.infer<typeof InventoryTableSchemaZod>

// interface IInventoryTableModel extends InventoryTableType, Document { }

// const InventoryTableSchema = new Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//         },
//         attributes: [{
//             name: {
//                 type: String,
//                 required: true
//             },
//             dataType: {
//                 type: String,
//                 enum: ["string", "number", "data", "boolean"],
//                 default: "string"
//             }
//         }]
//     },
//     {
//         timestamps: true,
//     }
// )

// export const InventoryTable = mongoose.model<IInventoryTableModel>("InventoryTable", InventoryTableSchema)

// Updated Zod Schema
export const InventoryTableSchemaZod = z.object({
  name: z.string().min(2),
  attributes: z.array(z.object({
    name: z.string(),
    dataType: z.string()
  })).min(1)
});

export type InventoryTableType = z.infer<typeof InventoryTableSchemaZod>;

const InventoryTableSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  attributes: [{
    name: { type: String, required: true },
    dataType: { type: String, required: true } 
  }]
}, { timestamps: true });

export const InventoryTable = mongoose.models.InventoryTable ||mongoose.model("InventoryTable", InventoryTableSchema);