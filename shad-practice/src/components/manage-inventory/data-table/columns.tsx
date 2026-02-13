import type { ColumnDef } from "@tanstack/react-table"

export const createColumns = (attributes: string[]): ColumnDef<any>[] => {
    const baseColumns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Item Name",
        }
    ]

    const dynamicColumns = attributes.map((attr) => ({
        accessorKey: attr.toLowerCase().replace(/\s+/g, '_'),
        header: attr,
    }))

    return [...baseColumns, ...dynamicColumns]
}