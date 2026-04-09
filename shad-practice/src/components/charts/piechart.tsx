import { useState, useMemo, useEffect } from "react";
import { Pie, PieChart, Cell, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { useQuery } from "@tanstack/react-query";
import EditIcon from '@mui/icons-material/Edit';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, PackagePlus } from "lucide-react";
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

export const description = "A dynamic pie chart showing inventory health";

export function PieChartComponent() {
    const [open, setOpen] = useState(false);

    const [selectedTableId, setSelectedTableId] = useState<string | null>(() => {
        const saved = localStorage.getItem("preferredPieChartTable");
        if (saved === "none") return null;
        return saved && saved !== "null" ? saved : null;
    });

    const [tempTableId, setTempTableId] = useState<string | null>(null);

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

    useEffect(() => {
        const saved = localStorage.getItem("preferredPieChartTable");
        if (tables && tables.length > 0 && !saved) {
            const firstTableId = tables[0]._id;
            setSelectedTableId(firstTableId);
            localStorage.setItem("preferredPieChartTable", firstTableId);
        }
    }, [tables]);

    const { data: tableItems, isLoading } = useQuery({
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

    // UPDATED LOGIC: We now track the specific "worst" item for the bottom text
    const { chartData, stats, worstCritical, worstLow } = useMemo(() => {
        let critical = 0;
        let runningLow = 0;
        let healthy = 0;
        let overstock = 0;

        let worstCriticalItem = { name: "", percent: Infinity };
        let worstLowItem = { name: "", percent: Infinity };

        if (tableItems && tableItems.length > 0) {
            tableItems.forEach((item: any) => {
                const stock = item.currentStock !== undefined ? item.currentStock : (item.inStock || 0);
                const par = item.parLevel || 0;

                if (par === 0) {
                    healthy++;
                    return;
                }

                const percent = (stock / par) * 100;

                if (percent < 20) {
                    critical++;
                    if (percent < worstCriticalItem.percent) {
                        worstCriticalItem = { name: item.name, percent };
                    }
                } else if (percent < 50) {
                    runningLow++;
                    if (percent < worstLowItem.percent) {
                        worstLowItem = { name: item.name, percent };
                    }
                } else if (percent <= 100) {
                    healthy++;
                } else {
                    overstock++;
                }
            });
        }

        const data = [
            { name: "Critical (<20%)", amount: critical, fill: "#EF4444" },
            { name: "Running Low (<50%)", amount: runningLow, fill: "#F97316" },
            { name: "Healthy (50-100%)", amount: healthy, fill: "#22C55E" },
            { name: "Overstock (>100%)", amount: overstock, fill: "#3B82F6" },
        ].filter(d => d.amount > 0);

        return {
            chartData: data,
            stats: { critical, runningLow, healthy, overstock },
            worstCritical: worstCriticalItem.name ? worstCriticalItem : null,
            worstLow: worstLowItem.name ? worstLowItem : null
        };
    }, [tableItems]);

    const chartConfig = {
        amount: { label: "Items" },
    } satisfies ChartConfig;

    const handleSaveChanges = () => {
        setSelectedTableId(tempTableId);
        if (tempTableId) {
            localStorage.setItem("preferredPieChartTable", tempTableId);
        } else {
            localStorage.setItem("preferredPieChartTable", "none");
        }
        setOpen(false);
    };

    const handleClearSelection = () => {
        setTempTableId(null);
        setSelectedTableId(null);
        localStorage.setItem("preferredPieChartTable", "none");
        setOpen(false);
    };

    const currentTable = tables?.find((t: any) => t._id === selectedTableId);
    const currentTableName = isTablesLoading ? "Loading..." : (currentTable?.name || "None Selected");

    // UPDATED LOGIC: Dynamic text injection based on worst offenders
    let StatusIcon = CheckCircle2;
    let iconColor = "text-green-500";
    let statusText = "Inventory is at healthy levels.";

    if (isTablesLoading) {
        StatusIcon = Info;
        iconColor = "text-neutral-500";
        statusText = "Loading table data...";
    } else if (!currentTable) {
        StatusIcon = Info;
        iconColor = "text-neutral-500";
        statusText = "No tables selected yet.";
    } else if (stats.critical > 0 && worstCritical) {
        StatusIcon = AlertCircle;
        iconColor = "text-red-500";
        const others = stats.critical - 1;
        const othersText = others > 0 ? ` (+${others} more)` : "";
        statusText = `Critical: ${worstCritical.name} is at ${Math.round(worstCritical.percent)}% of par goal${othersText}.`;
    } else if (stats.runningLow > 0 && worstLow) {
        StatusIcon = AlertTriangle;
        iconColor = "text-orange-500";
        const others = stats.runningLow - 1;
        const othersText = others > 0 ? ` (+${others} more)` : "";
        statusText = `Action needed: ${worstLow.name} is running low (${Math.round(worstLow.percent)}%)${othersText}.`;
    } else if (stats.overstock > 0 && stats.healthy === 0) {
        StatusIcon = PackagePlus;
        iconColor = "text-blue-500";
        statusText = `Note: ${stats.overstock} items are overstocked.`;
    } else if (!tableItems || tableItems.length === 0) {
        StatusIcon = Info;
        iconColor = "text-neutral-500";
        statusText = "No items found in this table.";
    }

    return (
        <Card className="flex flex-col h-full w-full min-h-[400px] relative">
            <CardHeader className="items-start pb-0 pr-12">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <CardTitle>Inventory Health</CardTitle>
                        <CardDescription className="mt-1">
                            Table: <span className="text-neutral-700 font-medium">{currentTableName}</span>
                        </CardDescription>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (val) setTempTableId(selectedTableId);
                }}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer">
                            <EditIcon fontSize="small" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Table Source</DialogTitle>
                            <DialogDescription className="flex flex-col items-start">
                                Choose which table's inventory you want to analyze.
                            </DialogDescription>
                        </DialogHeader>

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
                                        const count = table.itemCount ?? table.items?.length ?? '?';

                                        return (
                                            <div
                                                key={table._id}
                                                className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row justify-between border border-neutral-800 rounded-[0.625rem] p-6 items-center ${isSelected
                                                    ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white"
                                                    : "bg-neutral-300 text-neutral-900"
                                                    }`}
                                                onClick={() => setTempTableId(table._id)}
                                            >
                                                <div className="flex gap-x-4 items-center">
                                                    <span className={`text-sm ${isSelected ? "text-white" : "text-neutral-900"}`}>{index + 1}.</span>
                                                    <span className="font-medium">{table.name}</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-neutral-400/30 text-neutral-700"}`}>
                                                    {count} items
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex w-full sm:justify-between items-center mt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={handleClearSelection}
                            >
                                Clear Selection
                            </Button>
                            <div className="flex gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                                </DialogClose>
                                <Button type="button" className="cursor-pointer" onClick={handleSaveChanges}>Save changes</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="flex-1 pb-4 mt-4">
                {isLoading || isTablesLoading ? (
                    <div className="mx-auto flex items-center justify-center aspect-square max-h-[300px] w-full">
                        <Skeleton className="h-[250px] w-[250px] rounded-full bg-neutral-800/50" />
                    </div>
                ) : !currentTable ? (
                    <div className="mx-auto flex items-center justify-center aspect-square max-h-[300px] w-full text-neutral-500 text-sm">
                        Please select a table to view data.
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="mx-auto flex items-center justify-center aspect-square max-h-[300px] w-full text-neutral-500 text-sm">
                        No active stock found in this table.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie data={chartData} dataKey="amount" nameKey="name" innerRadius={60} strokeWidth={2}>
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ paddingTop: "20px" }}
                            />
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>

            <CardFooter className="flex-col gap-2 text-sm text-center border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    <StatusIcon className={`w-4 h-4 ${iconColor}`} />
                    {statusText}
                </div>
                <div className="leading-none text-muted-foreground">
                    Based on current stock vs. established par levels.
                </div>
            </CardFooter>
        </Card>
    );
}