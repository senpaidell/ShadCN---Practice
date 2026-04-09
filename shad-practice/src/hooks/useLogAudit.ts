import { useMutation } from "@tanstack/react-query";

interface AuditPayload {
    targetName: string;
    tableName?: string;
    activity: string; // Broadened slightly to accept any string like "Stock Updated" or the specific ones below
    // NEW: Tell TypeScript to expect the changes object
    changes?: {
        added?: number;
        subtracted?: number;
        field?: string;
        oldValue?: string; // NEW
        newValue?: string;
    };
}

export function useLogAudit() {
    return useMutation({
        mutationFn: async (payload: AuditPayload) => {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/audits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to log audit activity");
            return res.json();
        },
        // Optional: If you want to silently fail without breaking the user's flow
        onError: (error) => {
            console.error("Audit log failed:", error);
        }
    });
}