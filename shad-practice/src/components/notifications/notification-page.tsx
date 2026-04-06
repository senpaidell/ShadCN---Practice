import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom"; // Updated to React Router

const API = "https://coshts-backend.vercel.app";

function NotificationCard({ number, item }: { number: string; item: any }) {
  const percent = item.calculatedPercentage;

  const urgencyColor =
    item.currentStock === 0 ? "bg-red-600" :
      percent < 10 ? "bg-red-500" :
        percent < 20 ? "bg-orange-500" :
          "bg-yellow-500";

  const label =
    item.currentStock === 0
      ? `"${item.name}" is completely out of stock.`
      : `"${item.name}" is low at ${percent.toFixed(1)}% of par level.`;

  const timeString = item.updatedAt
    ? new Date(item.updatedAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
    : "Unknown time";

  return (
    // Updated href to "to" for React Router
    <Link to={`/table/${item.tableId}`} className="block">
      <div className="flex items-center justify-between p-4 mb-2 border border-neutral-800 rounded-[0.625rem] bg-neutral-200 hover:brightness-125 hover:border-neutral-800 transition duration-200 ease-in-out cursor-pointer">

        <div className="flex items-center">
          <span className={`flex items-center justify-center w-10 h-10 mr-4 font-mono text-sm font-bold text-white ${urgencyColor} rounded-full shrink-0`}>
            {number}
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-black font-medium">{label}</span>
            <span className="flex items-center text-xs text-neutral-500 mt-1">
              Table:&nbsp;<span className="font-bold">{item.tableName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center text-xs text-neutral-500 shrink-0 ml-4">
          <Clock className="w-3 h-3 mr-1" />
          {timeString}
        </div>

      </div>
    </Link>
  );
}

export default function Notification() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const token = localStorage.getItem("token");

  // Step 1: fetch all tables
  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ["tables-for-notification"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tables");
      return res.json();
    },
  });

  const tableIds = tables.map((t: any) => t._id).join(",");

  // Step 2: fetch all items
  const { data: allItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["dashboard-items", tableIds],
    queryFn: async () => {
      const res = await fetch(`${API}/api/items/dashboard?ids=${tableIds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: tableIds.length > 0,
    refetchInterval: 5000,
    retry: false,
    staleTime: 4000,
  });

  // Step 3: Calculate percentage, attach table info, filter, and sort
  const lowStockItems = allItems
    .map((item) => {
      const percentage = item.parLevel > 0
        ? (item.currentStock / item.parLevel) * 100
        : 0;

      const itemTableId = typeof item.table === 'object' ? item.table?._id : (item.table || item.tableId);
      const matchingTable = tables.find((t) => t._id === itemTableId);
      const tableName = matchingTable ? matchingTable.name : "Unknown Table";

      return {
        ...item,
        calculatedPercentage: percentage,
        tableId: itemTableId,
        tableName: tableName
      };
    })
    .filter((item) => item.currentStock === 0 || item.calculatedPercentage < 50)
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

  const totalPages = Math.ceil(lowStockItems.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = lowStockItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-4">
          <span className="text-neutral-400">Low Stock Items: </span>
          <span className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[14px]">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : lowStockItems.length}
          </span>
        </div>

        <div className="min-h-full">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 mb-2 rounded-[0.625rem] bg-neutral-800" />
            ))
          ) : currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <NotificationCard
                key={item._id}
                number={(startIndex + index + 1).toString().padStart(2, "0")}
                item={item}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-neutral-800 rounded-lg">
              All items are sufficiently stocked.
            </p>
          )}
        </div>

        {lowStockItems.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}>Back</Button>
            <span className="text-sm text-muted-foreground">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <Button variant="outline" size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}>Next</Button>
          </div>
        )}
      </CardContent>
    </div>
  );
}