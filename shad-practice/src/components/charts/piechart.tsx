// import { Pie, PieChart } from "recharts"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
// import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";

// export const description = "A simple pie chart"

// const chartData = [
//     {
//         item: "Flour",
//         percentage: 275,
//         fill: "#0070F3"
//     },
//     {
//         item: "Sugar",
//         percentage: 200,
//         fill: "#79FFE1"
//     },
//     {
//         item: "Milk",
//         percentage: 200,
//         fill: "#F81CE5"
//     },
//     {
//         item: "Butter",
//         percentage: 173,
//         fill: "#FFAA00"
//     },
//     {
//         item: "Eggs",
//         percentage: 90,
//         fill: "#EDEDED"
//     },
// ]

// const chartConfig = {
//     percentage: {
//         label: "Percentage",
//     },
// } satisfies ChartConfig


// export function PieChartComponent() {
//     return (
//         <>
//             <Card className="flex flex-col">
//                 <CardHeader className="items-center pb-0">
//                     <CardTitle>Remaining Items</CardTitle>
//                     <CardDescription>January - June 2024</CardDescription>
//                 </CardHeader>

//                 <CardContent className="flex-1 pb-0">
//                     <ChartContainer config={chartConfig} className="">
//                         <PieChart>
//                             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
//                             <Pie data={chartData} dataKey="percentage" nameKey="item" />
//                         </PieChart>
//                     </ChartContainer>
//                 </CardContent>
//             </Card>
//         </>
//     )
// }

import { useState, useMemo, useEffect } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { useQuery } from "@tanstack/react-query";
import EditIcon from '@mui/icons-material/Edit';
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";

const CHART_COLORS = [
    "#0070F3", "#79FFE1", "#F81CE5", "#FFAA00",
    "#EDEDED", "#FF5733", "#33FF57", "#3357FF"
];

export const description = "A dynamic pie chart showing items per table";

export function PieChartComponent() {
    const [open, setOpen] = useState(false);

    // The actual table ID driving the chart
    const [selectedTableId, setSelectedTableId] = useState<string | null>(() => {
        return localStorage.getItem("preferredPieChartTable") || null;
    });

    // The temporary table ID used while clicking around inside the modal
    const [tempTableId, setTempTableId] = useState<string | null>(null);

    // 1. Fetch all tables
    const { data: tables, isLoading: isTablesLoading } = useQuery({
        queryKey: ["tables"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/tables", {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch tables");
            return res.json();
        }
    });

    // Auto-select the first table if none exists
    useEffect(() => {
        if (tables && tables.length > 0 && !selectedTableId) {
            const firstTableId = tables[0]._id;
            setSelectedTableId(firstTableId);
            localStorage.setItem("preferredPieChartTable", firstTableId);
        }
    }, [tables, selectedTableId]);

    // 2. Fetch items for the chosen table
    const { data: tableItems } = useQuery({
        queryKey: ["tableItems", selectedTableId],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/${selectedTableId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch items");
            return res.json();
        },
        enabled: !!selectedTableId
    });

    // 3. Format data for Recharts
    const chartData = useMemo(() => {
        if (!tableItems) return [];
        return tableItems.map((item: any, index: number) => ({
            name: item.name,
            amount: item.inStock || 0,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        })).filter((item: any) => item.amount > 0);
    }, [tableItems]);

    const chartConfig = useMemo(() => {
        const config: Record<string, any> = {
            amount: { label: "Stock" }
        };
        chartData.forEach((item: any) => {
            config[item.name] = { label: item.name, color: item.fill };
        });
        return config satisfies ChartConfig;
    }, [chartData]);

    const currentTableName = tables?.find((t: any) => t._id === selectedTableId)?.name || "Loading...";

    // Handle saving the selection from the modal
    const handleSaveChanges = () => {
        if (tempTableId) {
            setSelectedTableId(tempTableId);
            localStorage.setItem("preferredPieChartTable", tempTableId);
        }
        setOpen(false);
    };

    return (
        <Card className="flex flex-col h-full relative">
            <CardHeader className="items-start pb-0 pr-12">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <CardTitle>Inventory Breakdown</CardTitle>
                        <CardDescription className="mt-1">
                            Table: <span className="text-neutral-700 font-medium">{currentTableName}</span>
                        </CardDescription>
                    </div>
                </div>

                {/* --- DIALOG MODAL IMPLEMENTATION --- */}
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (val) setTempTableId(selectedTableId); // Reset temp selection to current when opening
                }}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
                        >
                            <EditIcon fontSize="small" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Table Source</DialogTitle>
                            <DialogDescription className="flex flex-col items-start">
                                Choose which table's inventory you want to display on the pie chart.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Table List Container */}
                        <div className="h-64 border-white/10 border-1 rounded-[0.625rem] p-4 overflow-y-auto">
                            <div className="flex flex-col gap-y-2">
                                {isTablesLoading ? (
                                    [...Array(3)].map((_, i) => (<Skeleton key={i} className="h-[74px] w-full bg-neutral-800/50" />))
                                ) : tables?.length === 0 ? (
                                    <div className="flex justify-center items-center h-full min-h-[200px]">
                                        <span className="text-neutral-500">No tables found!</span>
                                    </div>
                                ) : (
                                    tables?.map((table: any, index: number) => {
                                        const isSelected = tempTableId === table._id;
                                        return (
                                            <div
                                                key={table._id}
                                                className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-neutral-800 rounded-[0.625rem] p-6 items-center ${isSelected
                                                    ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white"
                                                    : "bg-neutral-300 text-neutral-900"
                                                    }`}
                                                onClick={() => setTempTableId(table._id)}
                                            >
                                                <span className={`text-sm ${isSelected ? "text-white" : "text-neutral-900"}`}>
                                                    {index + 1}.
                                                </span>
                                                <span className="font-medium">{table.name}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="cursor-pointer">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                className="cursor-pointer"
                                onClick={handleSaveChanges}
                            >
                                Save changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            {/* --- PIE CHART DISPLAY --- */}
            <CardContent className="flex-1 pb-4 mt-4">
                {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                        No active stock found in this table.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={chartData}
                                dataKey="amount"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={2}
                            >
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}