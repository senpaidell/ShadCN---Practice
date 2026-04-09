"use client";

import { Button } from "@/components/ui/button";
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
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Default sort remains by createdAt (Oldest first)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: false }
  ]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnFilters,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  useEffect(() => {
    if (onTableInstance) {
      onTableInstance(table);
    }
  }, [table, onTableInstance]);

  return (
    <div className="space-y-4 w-full">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-neutral-400">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} items
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-neutral-400 mr-4">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer border-neutral-800 text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer border-neutral-800 text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}