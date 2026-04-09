import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, Table2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Borrowed from your add-tile component for matching loading states
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-800/50 ${className}`} />
  );
}

export function TableSelector() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // We use this to get the exact current path
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch all tables
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["all-tables"],
    queryFn: async () => {
      const res = await fetch("https://coshts-backend.vercel.app/api/tables", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tables");
      return res.json();
    },
  });

  // Get current table name
  const currentTable = tables.find((t: any) => t._id === id);
  const displayName = currentTable ? currentTable.name : "Select Table";

  // Pagination Logic
  const totalPages = Math.ceil(tables.length / itemsPerPage);
  const paginatedTables = tables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectTable = (tableId: string) => {
    setIsOpen(false);
    setCurrentPage(1);

    // Only navigate if clicking a different table
    if (tableId !== id) {
      // This now perfectly matches your App.tsx route!
      navigate(`/table/${tableId}`);
    }
  };

  return (
    <>
      {/* The Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white border-gray-300 text-black hover:bg-gray-100 min-w-[150px] justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-gray-500" />
          <span className="font-semibold">{isLoading ? "Loading..." : displayName}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </Button>

      {/* The Selection Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Switch Inventory Table</DialogTitle>
            <DialogDescription className="flex flex-col items-start mt-2">
              Select a category below to navigate to its inventory view. <br />
              <span className="mt-1">Tables Available: {tables.length}</span>
            </DialogDescription>
          </DialogHeader>

          {/* The styled container matching Add-Tile */}
          <div className="h-80 border-white/10 border rounded-[0.625rem] p-4 overflow-y-auto flex flex-col justify-between">
            <div className="flex flex-col gap-y-2">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-[74px] w-full" />
                ))
              ) : tables.length === 0 ? (
                <div className="flex justify-center items-center h-full min-h-[200px]">
                  <span className="text-neutral-500">No tables found!</span>
                </div>
              ) : (
                paginatedTables.map((table: any, index: number) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const isCurrent = table._id === id;

                  return (
                    <div
                      key={table._id}
                      onClick={() => handleSelectTable(table._id)}
                      className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row justify-between border border-neutral-800 rounded-[0.625rem] p-6 items-center ${isCurrent
                        ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white" // Force text to white for the whole container
                        : "bg-neutral-300"
                        }`}
                    >
                      <div className="flex gap-x-4 items-center">
                        <span className={`text-sm ${isCurrent ? "text-white" : "text-neutral-900"}`}>
                          {actualIndex}.
                        </span>
                        <span className={`font-medium ${isCurrent ? "text-white" : "text-neutral-900"}`}>
                          {table.name}
                        </span>
                      </div>

                      {isCurrent && (
                        <span className="text-xs px-2 py-1 rounded-full bg-black/20 text-white font-medium">
                          Current Table
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-neutral-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}