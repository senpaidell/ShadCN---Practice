import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Trash2 } from "lucide-react" // <--- Import icons
import { Button } from "../../ui/button"

// Export getDbKey so we can dynamically build the edit form later!
export const getDbKey = (attrName: string) => {
    if (attrName === "In Stock") return "inStock";
    if (attrName === "New Stock") return "newStock";
    return attrName.toLowerCase(); 
}

export const createColumns = (
    attributes: any[],
    onEdit: (item: any) => void,    // <--- Added callbacks
    onDelete: (item: any) => void
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

    // Action column with Edit and Delete buttons (Hidden by default, shown on group-hover)
    const actionColumn: ColumnDef<any> = {
        id: "actions",
        header: "", // Empty header so it doesn't say anything at the top
        cell: ({ row }) => {
            const item = row.original;
            return (
                // Notice the opacity-100 (always visible) combined with md:opacity-0 (hidden on larger screens until hover)
                <div className="flex items-center gap-2 opacity-100 transition-opacity justify-end pr-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                        onClick={() => onEdit(item)}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => onDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }

    return [...baseColumns, ...dynamicColumns, actionColumn]
}