import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AuditLog {
  _id: string;
  targetName: string;
  activity: string;
  tableName?: string;
  createdAt: string;
  user: {
    _id: string;
    email: string;
  };
  changes?: {
    added?: number;
    subtracted?: number;
    field?: string;
  };
}

export default function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audits'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://coshts-backend.vercel.app/api/audits", {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    }
  });

  //PAGINATION
  const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = auditLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-screen sm:p-10 p-4 flex flex-col gap-y-8">

      {/* HEADER SECTION */}
      <div className="manageTitle flex flex-col gap-y-2">
        <span className="text-3xl font-bold">Audit Logs</span>

        <h5 className="flex flex-col sm:flex-row sm:items-center gap-4 description text-neutral-400">
          <span>Track all system activities and changes here.</span>
          <span className="sm:ml-auto">

            {/* FILTER DIALOG */}
            {/* <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-md px-6 h-8 text-xs font-bold w-full sm:w-auto">
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 text-white sm:max-w-[425px] border-neutral-800 w-[95vw] sm:w-full">
                <div className="py-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-left">Filter</DialogTitle>
                    <p className="text-xs text-zinc-400 text-left pt-1">
                      Select the attribute/s you want to filter.
                    </p>
                  </DialogHeader>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <div className="flex-1 bg-neutral-800 p-4 rounded-[0.625rem] space-y-4 border border-white/5">
                      <div className="flex items-center space-x-3">
                        <Checkbox id="name" className="border-zinc-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                        <label htmlFor="name" className="text-xs font-bold text-white">Name & Email</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox id="activity" className="border-zinc-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                        <label htmlFor="activity" className="text-xs font-bold text-white">Activity</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox id="date" className="border-zinc-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                        <label htmlFor="date" className="text-xs font-bold text-white">Date</label>
                      </div>
                    </div>

                    <div className="sm:w-1/3 flex flex-row sm:flex-col gap-y-2 gap-x-4 justify-center items-center rounded-[0.625rem] border border-white/5 p-4 text-center bg-neutral-800">
                      <div><Settings2 size={24} className="text-neutral-400" /></div>
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-white text-left sm:text-center">Custom</div>
                        <div className="text-neutral-500 text-[9px] leading-tight text-left sm:text-center">Choose what you want to see</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="ghost" className="flex-1 text-xs font-bold h-9">Cancel</Button>
                    <Button className="flex-1 bg-white text-black hover:bg-neutral-200 text-xs font-bold h-9">Confirm</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog> */}

          </span>
        </h5>

        <div className="mt-2">
          <span className="text-neutral-400">Total Logs: </span>
          <span className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[14px]">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : auditLogs.length}
          </span>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="tableLoc flex flex-col gap-y-4">
        {isLoading ? (
          // Loading Skeletons
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex flex-col md:flex-row gap-4 border border-neutral-800 rounded-[0.625rem] bg-neutral-300/50 p-4 md:p-10 items-start md:items-center h-24"></div>
          ))
        ) : currentItems.length === 0 ? (
          <div className="text-neutral-500 text-center py-10 border border-dashed border-neutral-800 rounded-lg">
            No audit logs found.
          </div>
        ) : (
          currentItems.map((log, index) => (
            <div
              key={log._id}
              className="hover:brightness-125 transition duration-200 ease-in-out flex flex-col md:flex-row gap-4 border border-neutral-800 rounded-[0.625rem] bg-neutral-300 p-4 md:p-10 items-start md:items-center"
            >
              <div className="text-sm text-neutral-900 w-6 shrink-0 hidden md:block">
                {startIndex + index + 1}.
              </div>

              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-x-4 min-w-0 w-full">

                {/* Number & Name for Mobile */}
                <div className="flex items-center gap-2 md:w-48 shrink-0 min-w-0">
                  <span className="text-sm text-neutral-900 md:hidden shrink-0">
                    {startIndex + index + 1}.
                  </span>
                  <span className="text-lg font-medium text-neutral-900 truncate">
                    {log.targetName}
                  </span>
                </div>

                {log.tableName && (
                  <span className="text-sm text-neutral-600 md:w-48 truncate shrink-0">
                    Table: {log.tableName}
                  </span>
                )}

                <span className="text-sm text-neutral-600 md:w-48 truncate shrink-0">
                  {log.user?.email || "Unknown User"}
                </span>

                {/* Activity Badge */}
                <span className="text-xs font-semibold text-neutral-800 bg-neutral-400/30 border border-neutral-400/50 px-3 py-1.5 rounded-md w-max shrink-0 mt-1 md:mt-0">
                  {log.activity}
                </span>

                {/* NEW: Added / Subtracted Values Display */}
                {log.changes && (
                  <div className="flex items-center gap-2 shrink-0 mt-1 md:mt-0">
                    {log.changes.added !== undefined && log.changes.added > 0 && (
                      <span className="text-xs font-bold text-green-700 bg-green-500/20 border border-green-500/30 px-2 py-1 rounded-md">
                        +{log.changes.added} {log.changes.field}
                      </span>
                    )}
                    {log.changes.subtracted !== undefined && log.changes.subtracted > 0 && (
                      <span className="text-xs font-bold text-red-700 bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-md">
                        -{log.changes.subtracted} {log.changes.field}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <span className="md:ml-auto text-neutral-600 text-sm mt-2 md:mt-0 shrink-0 text-right">
                {new Date(log.createdAt).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {auditLogs.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-900 font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}