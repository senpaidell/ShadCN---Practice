import { useMutation } from "@tanstack/react-query";

interface AuditPayload {
    targetName: string;
    tableName?: string;
    activity: "Item deleted" | "Item edited" | "Item Added" | "Item Subtracted" | "New Item";
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