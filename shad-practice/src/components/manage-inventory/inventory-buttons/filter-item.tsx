import type { Table } from "@tanstack/react-table";
import { CircleCheck, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { getDbKey } from "../data-table/columns";

interface FilterItemProps {
  tableData: any;
  table: Table<any>;
}

export function FilterItem({ tableData, table }: FilterItemProps) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState(true);

  // --- Local States for Instant UI Updates ---
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeStock, setActiveStock] = useState<string>("All");
  const [activeExp, setActiveExp] = useState<string>("All");

  // Logic to get unique categories from the current rows
  const uniqueCategories = Array.from(
    new Set(table.getCoreRowModel().rows.map((row) => row.original.category)),
  ).filter(Boolean) as string[];

  // Sync dialog UI with table state when opened
  useEffect(() => {
    if (open && table) {
      // Sync Visibility
      const visibility: Record<string, boolean> = {};
      table.getAllLeafColumns().forEach((col) => {
        visibility[col.id] = col.getIsVisible();
      });
      setLocalVisibility(visibility);

      // Sync Category
      const catFilter = table.getColumn("category")?.getFilterValue() as string;
      setActiveCategory(catFilter || "All");

      // Sync Status & Expiration
      const statusFilterState = table.getColumn("status")?.getFilterValue() as { stockFilter: string, expFilter: string } | undefined;
      setActiveStock(statusFilterState?.stockFilter || "All");
      setActiveExp(statusFilterState?.expFilter || "All");
    }
  }, [open, table]);

  const availableAttributes = [
    { name: "Name", id: "name" },
    { name: "Category", id: "category" },
    ...(tableData?.attributes || [])
      .filter((a: any) => {
        const n = typeof a === "string" ? a : a.name;
        return n !== "Name" && n !== "Category";
      })
      .map((a: any) => {
        const n = typeof a === "string" ? a : a.name;
        return { name: n, id: getDbKey(n) };
      }),
    { name: "Status", id: "status" },
  ];

  const handleSelectAll = (val: boolean) => {
    table.toggleAllColumnsVisible(val);
    table.getColumn("rowNumber")?.toggleVisibility(true);
    table.getColumn("actions")?.toggleVisibility(true);
    const newVis: Record<string, boolean> = {};
    table.getAllLeafColumns().forEach((col) => {
      newVis[col.id] = col.getIsVisible();
    });
    setLocalVisibility(newVis);
  };

  const handleToggle = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (column) {
      const nextValue = !column.getIsVisible();
      column.toggleVisibility(nextValue);
      setLocalVisibility((prev) => ({ ...prev, [columnId]: nextValue }));
    }
  };

  // --- Updated Handlers with Local State ---
  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category); // Update UI instantly
    if (category === "All") {
      table.getColumn("category")?.setFilterValue(undefined);
    } else {
      table.getColumn("category")?.setFilterValue(category);
    }
  };

  const handleStockFilter = (status: string) => {
    setActiveStock(status); // Update UI instantly
    table.getColumn("status")?.setFilterValue({
      stockFilter: status,
      expFilter: activeExp
    });
  };

  const handleExpFilter = (status: string) => {
    setActiveExp(status); // Update UI instantly
    table.getColumn("status")?.setFilterValue({
      stockFilter: activeStock,
      expFilter: status
    });
  };

  const isAllSelected = availableAttributes.every(
    (attr) => localVisibility[attr.id] !== false,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setChoice(true);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Filter Table</DialogTitle>
          <DialogDescription>
            Choose attributes to see or filter by category and status.
          </DialogDescription>
        </DialogHeader>

        {choice ? (
          <div className="flex flex-row justify-center gap-x-4 h-78 w-full">
            <div
              onClick={() => handleSelectAll(true)}
              className={`w-1/2 cursor-pointer transition duration-200 ease-in-out flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border p-4 text-center ${isAllSelected
                ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white border-black border"
                : "bg-neutral-300 border-black border hover:brightness-125"
                }`}
            >
              <div>
                <CircleCheck size={32} />
              </div>
              <div>All in One!</div>
              <div className="text-xs">Show all available table columns</div>
            </div>

            <div
              onClick={() => setChoice(false)}
              className="w-1/2 cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border border-black p-4 text-center bg-neutral-300"
            >
              <div>
                <Settings2 size={32} />
              </div>
              <div>Custom</div>
              <div className="text-xs">
                Choose specific settings and categories
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Column Visibility Section */}
            <div className="space-y-2">
              <span className="text-sm font-bold uppercase text-neutral-500">
                Display Columns
              </span>
              <div className="flex flex-row gap-4 w-full h-48">
                <div className="w-full sm:w-2/3 flex flex-col gap-y-2 border border-black rounded-[0.625rem] p-4 bg-neutral-200 overflow-y-auto">
                  {availableAttributes.map((attr, index) => {
                    const isVisible = localVisibility[attr.id] !== false;
                    return (
                      <div
                        key={attr.id}
                        className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-black rounded-[0.625rem] p-3 items-center shrink-0 ${isVisible
                          ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white"
                          : "bg-neutral-400 text-neutral-600 border-neutral-500"
                          }`}
                        onClick={() => handleToggle(attr.id)}
                      >
                        <span
                          className={`text-xs ${isVisible ? "text-white" : "text-neutral-500"}`}
                        >
                          {index + 1}.
                        </span>
                        <span className="text-sm font-medium">{attr.name}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden sm:flex w-1/3 flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border border-black p-4 text-center bg-neutral-300 text-neutral-600">
                  <Settings2 size={24} />
                  <span className="text-xs font-bold">Visibility</span>
                </div>
              </div>
            </div>

            {/* Category Filter Section */}
            <div className="space-y-2">
              <span className="text-sm font-bold uppercase text-neutral-500">
                Filter by Category
              </span>
              <div className="flex flex-wrap gap-2 p-4 border border-black rounded-[0.625rem] bg-neutral-200">
                <Button
                  variant="outline"
                  size="sm"
                  className={`cursor-pointer rounded-full ${activeCategory === "All" ? "bg-black text-white hover:bg-black/90" : "bg-neutral-400 text-black"}`}
                  onClick={() => handleCategoryFilter("All")}
                >
                  All
                </Button>
                {uniqueCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer rounded-full ${activeCategory === cat ? "bg-black text-white hover:bg-black/90" : "bg-neutral-400 text-black"}`}
                    onClick={() => handleCategoryFilter(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stock Status Filter Section */}
            <div className="space-y-2">
              <span className="text-sm font-bold uppercase text-neutral-500">
                Filter by Stock Status
              </span>
              <div className="flex flex-wrap gap-2 p-4 border border-black rounded-[0.625rem] bg-neutral-200">
                {["All", "Good", "Low", "Over"].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer rounded-full ${activeStock === status ? "bg-black text-white hover:bg-black/90" : "bg-neutral-400 text-black"}`}
                    onClick={() => handleStockFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Expiration Status Filter Section */}
            <div className="space-y-2">
              <span className="text-sm font-bold uppercase text-neutral-500">
                Filter by Expiration
              </span>
              <div className="flex flex-wrap gap-2 p-4 border border-black rounded-[0.625rem] bg-neutral-200">
                {["All", "Valid", "Expired", "Expiring Soon"].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer rounded-full ${activeExp === status ? "bg-black text-white hover:bg-black/90" : "bg-neutral-400 text-black"}`}
                    onClick={() => handleExpFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between w-full mt-4">
          {!choice && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto cursor-pointer"
              onClick={() => setChoice(true)}
            >
              Go Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}