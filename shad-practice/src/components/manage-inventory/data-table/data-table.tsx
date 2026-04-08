"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel, // Added this
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onTableInstance?: (table: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onTableInstance,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // Added this

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Added this
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters, // Added this
    state: {
      columnVisibility,
      columnFilters, // Added this
    },
  });

  useEffect(() => {
    if (onTableInstance) {
      onTableInstance(table);
    }
  }, [table, onTableInstance]);

  return (
    <div className="rounded-md border border-neutral-800 w-full">
      <Table>
        <TableHeader className="bg-neutral-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-neutral-800 hover:bg-neutral-900"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={`text-neutral-400 ${header.column.id === "actions"
                        ? "sticky right-0 z-20 bg-neutral-900 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.2)] border-l border-neutral-800 sm:static sm:z-auto sm:bg-transparent sm:shadow-none sm:border-l-0"
                        : ""
                      }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-neutral-800 hover:bg-neutral-800/50 group"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.id === "actions"
                        ? "sticky right-0 z-20 bg-neutral-900 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.2)] border-l border-neutral-800 sm:static sm:z-auto sm:bg-transparent sm:shadow-none sm:border-l-0"
                        : ""
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
