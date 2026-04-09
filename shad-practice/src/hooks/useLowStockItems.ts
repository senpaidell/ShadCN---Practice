// hooks/useLowStockItems.ts
import { useQuery } from "@tanstack/react-query";

export function useLowStockItems() {
    const token = localStorage.getItem("token");

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

    const { data: totalAlertCount = 0, isLoading } = useQuery({
        queryKey: ["total-alerts-count", tableIds],
        queryFn: async () => {
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/dashboard?ids=${tableIds}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allItems: any[] = await res.json();

            let alertsCount = 0;
            const today = new Date();

            allItems.forEach((item) => {
                // 1. REPLICATE STOCK ALERT LOGIC
                const percentage = item.parLevel > 0
                    ? (item.currentStock / item.parLevel) * 100
                    : 0;

                if (item.currentStock === 0 || percentage < 50) {
                    alertsCount++;
                }

                // 2. REPLICATE EXPIRATION ALERT LOGIC
                if (item.expiration) {
                    const expDate = new Date(item.expiration);
                    const timeDiff = expDate.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    if (daysDiff <= 30) {
                        alertsCount++;
                    }
                }
            });

            return alertsCount;
        },
        enabled: tableIds.length > 0,
        refetchInterval: 5000,
    });

    // We return it as an array-like structure or just the count 
    // to keep your NavBar.tsx from breaking
    return {
        lowStockItems: { length: totalAlertCount },
        isLoading
    };
}