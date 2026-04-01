import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Trash2, Package } from "lucide-react"
import { Button } from "../../ui/button"

export const getDbKey = (attrName: string) => {
    if (attrName === "Current Stock") return "currentStock";
    if (attrName === "Par Level") return "parLevel";
    return attrName.toLowerCase();
}

export const createColumns = (
    attributes: any[],
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
    onStockChange: (item: any) => void // 1. Added new prop here
): ColumnDef<any>[] => {

    const baseColumns: ColumnDef<any>[] = [
        {
            id: "rowNumber",
            header: () => (<div className="text-center">#</div>),
            cell: ({ row }) => <div className="text-center text-muted-foreground">{row.index + 1}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: "Item Name",
        },
    ]

    const dynamicColumns = attributes
        .filter((attr: any) => {
            const attrName = typeof attr === 'string' ? attr : attr.name;
            return attrName !== "Name";
        })
        .map((attr: any) => {
            const attrName = typeof attr === 'string' ? attr : attr.name;

            return {
                accessorKey: getDbKey(attrName),
                header: attrName,
                cell: ({ getValue }: any) => getValue() ?? "-",
            };
        })

    const statusColumn: ColumnDef<any> = {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const current = row.original.currentStock || 0;
            const par = row.original.parLevel || 1;

            const percentage = Math.round((current / par) * 100);

            let colorClass = "text-green-500 bg-green-500/10 border-green-500/20";
            let label = "Good";

            if (percentage < 30) {
                colorClass = "text-red-500 bg-red-500/10 border-red-500/20";
                label = "Low";
            } else if (percentage > 110) {
                colorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                label = "Over";
            }

            return (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
                    {label} ({percentage}%)
                </div>
            )
        }
    }

    const actionColumn: ColumnDef<any> = {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center gap-2 opacity-100 transition-opacity justify-end pr-2">
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800" onClick={() => onEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    {/* 2. Hooked up the Package button to our new function */}
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800" onClick={() => onStockChange(item)}>
                        <Package className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }

    return [...baseColumns, ...dynamicColumns, statusColumn, actionColumn]
}