// src/hooks/useLowStockItems.ts
import { useQuery } from "@tanstack/react-query";

const API = "https://coshts-backend.vercel.app";

export function useLowStockItems() {
    const token = localStorage.getItem("token");

    // Fetch all tables
    const { data: tables = [], isLoading: isTablesLoading } = useQuery<any[]>({
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

    // Fetch all items via dashboard endpoint
    const { data: allItems = [], isLoading: isItemsLoading } = useQuery<any[]>({
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

    // Filter client-side — zero stock OR balance below threshold
    const lowStockItems = allItems
        .filter((item) => item.inStock === 0 || item.balance < 50)
        .sort((a, b) => a.inStock - b.inStock || a.balance - b.balance);

    return {
        lowStockItems,
        isLoading: isTablesLoading || isItemsLoading,
    };
}