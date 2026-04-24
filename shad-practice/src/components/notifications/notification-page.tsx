import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const API = "https://coshts-backend.vercel.app";

// 1. Updated NotificationCard to accept our new 'alert' object format
function NotificationCard({ number, alert }: { number: string; alert: any }) {
  let urgencyColor = "bg-yellow-500"; // Default caution
  if (alert.severity === "critical") urgencyColor = "bg-red-500";
  if (alert.severity === "warning") urgencyColor = "bg-orange-500";

  const timeString = alert.updatedAt
    ? new Date(alert.updatedAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
    : "Unknown time";

  return (
    <Link to={`/table/${alert.tableId}?highlight=${alert.itemId}`} className="block">
      <div className="flex items-center justify-between p-4 mb-2 border border-neutral-800 rounded-[0.625rem] bg-neutral-200 hover:brightness-125 hover:border-neutral-800 transition duration-200 ease-in-out cursor-pointer">

        <div className="flex items-center">
          <span className={`flex items-center justify-center w-10 h-10 mr-4 font-mono text-sm font-bold text-white ${urgencyColor} rounded-full shrink-0`}>
            {number}
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-black font-medium">{alert.message}</span>
            <span className="flex items-center text-xs text-neutral-500 mt-1">
              Table:&nbsp;<span className="font-bold">{alert.tableName}</span>
              &nbsp;•&nbsp;
              <span className="capitalize text-neutral-600 font-medium">{alert.type} Alert</span>
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

  // Step 3: Process items into separate alerts (Stock and Expiration)
  const alerts: any[] = [];

  allItems.forEach((item) => {
    const itemTableId = typeof item.table === 'object' ? item.table?._id : (item.table || item.tableId);
    const matchingTable = tables.find((t) => t._id === itemTableId);
    const tableName = matchingTable ? matchingTable.name : "Unknown Table";

    // --- CHECK STOCK ---
    const percentage = item.parLevel > 0 ? (item.currentStock / item.parLevel) * 100 : 0;
    if (item.currentStock === 0 || percentage < 50) {
      let severity = "caution"; // Default yellow
      if (item.currentStock === 0 || percentage < 10) severity = "critical"; // Red
      else if (percentage < 20) severity = "warning"; // Orange

      const label = item.currentStock === 0
        ? `"${item.name}" is completely out of stock.`
        : `"${item.name}" is low at ${percentage.toFixed(1)}% of par level.`;

      alerts.push({
        id: `${item._id}-stock`,
        itemId: item._id,
        type: "Stock",
        severity,
        message: label,
        tableName,
        tableId: itemTableId,
        updatedAt: item.updatedAt
      });
    }

    // --- CHECK EXPIRATION ---
    if (item.expiration) {
      const today = new Date();
      const expDate = new Date(item.expiration);
      const timeDiff = expDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= 30) {
        let severity = "caution"; // Default yellow
        let label = "";

        if (daysDiff < 0) {
          severity = "critical"; // Red
          label = `"${item.name}" has expired!`;
        } else if (daysDiff === 0) {
          severity = "critical"; // Red
          label = `"${item.name}" expires today!`;
        } else if (daysDiff <= 7) {
          severity = "warning"; // Orange
          label = `"${item.name}" is expiring very soon (${daysDiff} days).`;
        } else {
          severity = "caution"; // Yellow
          label = `"${item.name}" is nearing expiration (${daysDiff} days).`;
        }

        alerts.push({
          id: `${item._id}-expiration`,
          type: "Expiration",
          itemId: item._id,
          severity,
          message: label,
          tableName,
          tableId: itemTableId,
          updatedAt: item.updatedAt
        });
      }
    }
  });

  // Sort alerts by most recently updated
  alerts.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Pagination Logic
  const totalPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentAlerts = alerts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-neutral-400">Total Alerts: </span>
            <span className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[14px]">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : alerts.length}
            </span>
          </div>
          <h5 className="my-2 flex justify-start items-center gap-2 text-neutral-400 text-sm">
            <span className="lg:block hidden">Legend:</span>
            <h5 className="border-1 px-4 py-1 font-bold text-neutral-200 border-rose-400 rounded-full bg-red-500 text-xs flex items-center justify-center">Critical</h5>
            <h5 className="border-1 px-4 py-1 font-bold text-neutral-200 border-orange-500 rounded-full bg-orange-500 text-xs flex items-center justify-center">Warning</h5>
            <h5 className="border-1 px-4 py-1 font-bold text-neutral-200 border-yellow-500 rounded-full bg-yellow-500 text-xs flex items-center justify-center">Caution</h5>
          </h5>
        </div>

        <div className="min-h-full">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 mb-2 rounded-[0.625rem] bg-neutral-800" />
            ))
          ) : currentAlerts.length > 0 ? (
            currentAlerts.map((alert, index) => (
              <NotificationCard
                key={alert.id}
                number={(startIndex + index + 1).toString().padStart(2, "0")}
                alert={alert}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-neutral-800 rounded-lg">
              All items are sufficiently stocked and not expiring soon.
            </p>
          )}
        </div>

        {
          alerts.length > ITEMS_PER_PAGE && (
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
          )
        }
      </CardContent >
    </div >
  );
}