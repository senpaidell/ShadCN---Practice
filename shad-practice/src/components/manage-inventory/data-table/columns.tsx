import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Trash2, Package, ArrowUpDown } from "lucide-react"
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
    onStockChange: (item: any) => void
): ColumnDef<any>[] => {

    const baseColumns: ColumnDef<any>[] = [
        {
            id: "rowNumber",
            header: () => (<div className="text-center">#</div>),
            cell: ({ row, table }) => {
                // Get pagination state from the table
                const { pageIndex, pageSize } = table.getState().pagination;

                // Find the index of the row on the CURRENT page
                const localIndex = table.getRowModel().rows.findIndex((r) => r.id === row.id);

                // Calculate the absolute number across all pages
                const absoluteIndex = (pageIndex * pageSize) + localIndex + 1;

                return (
                    <div className="text-center text-muted-foreground">
                        {absoluteIndex}
                    </div>
                );
            }
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 font-bold flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                >
                    Item Name
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        { accessorKey: "category", header: "Category" },
    ]

    const dynamicColumns = attributes
        .filter((attr: any) => {
            const attrName = typeof attr === 'string' ? attr : attr.name;
            return !["Name", "Category", "Date Added"].includes(attrName);
        })
        .map((attr: any) => {
            const attrName = typeof attr === 'string' ? attr : attr.name;
            const dbKey = getDbKey(attrName);

            return {
                accessorKey: dbKey,
                header: attrName,
                cell: ({ row }: any) => {
                    const val = row.original[dbKey];
                    if (attrName === "Volume" && val) {
                        return `${val} ${row.original.volumeUnit || ""}`;
                    }
                    if (attrName === "Expiration" && val) {
                        return new Date(val).toLocaleDateString();
                    }
                    return val ?? "-";
                },
            };
        })

    const statusColumn: ColumnDef<any> = {
        id: "status",
        header: "Status",
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;
            const { stockFilter = "All", expFilter = "All" } = filterValue;

            let rowStockStatus = "Good";
            const current = row.original.currentStock || 0;
            const par = row.original.parLevel;

            if (!par || par === 0) {
                rowStockStatus = "No Par Level";
            } else {
                const percentage = Math.round((current / par) * 100);
                if (percentage < 50) rowStockStatus = "Low";
                else if (percentage > 110) rowStockStatus = "Over";
            }

            let rowExpStatus = "Valid";
            const expirationDate = row.original.expiration;
            if (expirationDate) {
                const today = new Date();
                const expDate = new Date(expirationDate);
                const timeDiff = expDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (daysDiff < 0) rowExpStatus = "Expired";
                else if (daysDiff <= 30) rowExpStatus = "Expiring Soon";
            }

            const matchesStock = stockFilter === "All" || rowStockStatus === stockFilter;
            const matchesExp = expFilter === "All" || rowExpStatus === expFilter;
            return matchesStock && matchesExp;
        },
        cell: ({ row }) => {
            const current = row.original.currentStock || 0;
            const par = row.original.parLevel;

            let stockColorClass = "";
            let stockLabel = "";
            let percentage: number | null = null;
            let isNoPar = false;


            if (!par || par === 0) {
                isNoPar = true;
                stockLabel = "No Par Level";
                stockColorClass = "text-neutral-200 bg-neutral-600 border-black";
            } else {
                percentage = Math.round((current / par) * 100);

                if (percentage < 50) {
                    stockColorClass = "text-red-500 bg-red-500/10 border-red-500/20";
                    stockLabel = "Low";
                } else if (percentage > 110) {
                    stockColorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                    stockLabel = "Over";
                } else {
                    stockColorClass = "text-green-500 bg-green-500/10 border-green-500/20";
                    stockLabel = "Good";
                }
            }

            const expirationDate = row.original.expiration;
            let expirationBadge = null;

            if (expirationDate) {
                const today = new Date();
                const expDate = new Date(expirationDate);
                const timeDiff = expDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (daysDiff < 0) {
                    expirationBadge = (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border text-red-500 bg-red-500/10 border-red-500/20 whitespace-nowrap">
                            Expired
                        </div>
                    );
                } else if (daysDiff <= 30) {
                    expirationBadge = (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border text-orange-500 bg-orange-500/10 border-orange-500/20 whitespace-nowrap">
                            Expiring Soon
                        </div>
                    );
                }
            }

            return (
                <div className="flex flex-wrap items-center gap-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${stockColorClass}`}>
                        {stockLabel} ({percentage}%)
                    </div>
                    {expirationBadge}
                </div>
            )
        }
    }

    const createdAtColumn: ColumnDef<any> = {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="hover:bg-transparent p-0 font-bold flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
                Date Added
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = row.original.createdAt;
            if (!date) return "-";

            const d = new Date(date);
            // Format: 4/30/2026, 1:45 PM
            return `${d.toLocaleDateString()}, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        }
    }

    const actionColumn: ColumnDef<any> = {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center gap-2 justify-end pr-2">
                    <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800" onClick={() => onEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
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

    return [...baseColumns, ...dynamicColumns, statusColumn, createdAtColumn, actionColumn]
}