import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const API = "https://coshts-backend.vercel.app";

function NotificationCard({ number, item }: { number: string; item: any }) {
  const urgencyColor =
    item.inStock === 0 ? "bg-red-600" :
      item.balance < 10 ? "bg-red-500" :
        item.balance < 20 ? "bg-orange-500" :
          "bg-yellow-500";

  const label =
    item.inStock === 0
      ? `"${item.name}" is completely out of stock.`
      : `"${item.name}" is low at ${item.balance.toFixed(1)}% balance.`;

  return (
    <div className="flex items-center p-4 mb-2 border border-white/10 rounded-[0.625rem] bg-neutral-900 hover:brightness-125 transition duration-200 ease-in-out">
      <span className={`flex items-center justify-center w-10 h-10 mr-4 font-mono text-sm font-bold text-white ${urgencyColor} rounded-full shrink-0`}>
        {number}
      </span>
      <span className="text-sm text-white">{label}</span>
    </div>
  );
}

export default function Notification() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const token = localStorage.getItem("token");

  // Step 1: fetch all tables (already deployed)
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

  // Step 2: fetch all items via dashboard endpoint (already deployed)
  const tableIds = tables.map((t: any) => t._id).join(",");

  const { data: allItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["dashboard-items", tableIds],
    queryFn: async () => {
      const res = await fetch(`${API}/api/items/dashboard?ids=${tableIds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: tableIds.length > 0, // wait until tables are loaded
    refetchInterval: 5000,
    retry: false,
    staleTime: 4000,
  });

  // Step 3: filter client-side — zero stock OR balance below threshold
  const lowStockItems = allItems
    .filter((item) => item.inStock === 0 || item.balance < 50)
    .sort((a, b) => a.inStock - b.inStock || a.balance - b.balance);

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
