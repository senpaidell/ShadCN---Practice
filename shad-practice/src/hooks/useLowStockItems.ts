// hooks/useLowStockItems.ts
import { useQuery } from "@tanstack/react-query";

export function useLowStockItems() {
    const token = localStorage.getItem("token");

    // 1. Fetch tables first (to get the IDs needed for the items query)
    const { data: tables = [] } = useQuery({
        queryKey: ["tables-for-badge"],
        queryFn: async () => {
            const res = await fetch("https://coshts-backend.vercel.app/api/tables", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.json();
        },
    });

    const tableIds = tables.map((t: any) => t._id).join(",");

    // 2. Fetch items and apply the EXACT same filter as notification-page.tsx
    const { data: lowStockItems = [], isLoading } = useQuery({
        queryKey: ["low-stock-badge-count", tableIds],
        queryFn: async () => {
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/dashboard?ids=${tableIds}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allItems: any[] = await res.json();

            return allItems.filter((item) => {
                const percentage = item.parLevel > 0
                    ? (item.currentStock / item.parLevel) * 100
                    : 0;

                // Match the Notification Page logic exactly:
                return item.currentStock === 0 || percentage < 50;
            });
        },
        enabled: tableIds.length > 0,
        refetchInterval: 5000, // Keep it updated
    });

    return { lowStockItems, isLoading };
}