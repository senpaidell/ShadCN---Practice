import { useState, useMemo, useEffect } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { useQuery } from "@tanstack/react-query";
import EditIcon from '@mui/icons-material/Edit';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
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

    // FIX: Ensure we don't accidentally load the string "null" from local storage
    const [selectedTableId, setSelectedTableId] = useState<string | null>(() => {
        const saved = localStorage.getItem("preferredPieChartTable");
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
        if (tables && tables.length > 0 && !selectedTableId) {
            const firstTableId = tables[0]._id;
            setSelectedTableId(firstTableId);
            localStorage.setItem("preferredPieChartTable", firstTableId);
        }
    }, [tables, selectedTableId]);

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

    const { chartData, stats } = useMemo(() => {
        let outOfStock = 0;
        let critical = 0;
        let runningLow = 0;
        let healthy = 0;

        if (tableItems && tableItems.length > 0) {
            tableItems.forEach((item: any) => {
                const stock = item.currentStock !== undefined ? item.currentStock : (item.inStock || 0);
                const par = item.parLevel || 0;

                if (stock === 0) {
                    outOfStock++;
                } else if (par > 0) {
                    const percent = (stock / par) * 100;
                    if (percent < 50) critical++;
                    else if (percent < 100) runningLow++;
                    else healthy++;
                } else {
                    healthy++;
                }
            });
        }

        const data = [];
        if (outOfStock > 0) data.push({ name: "Out of Stock", amount: outOfStock, fill: "#EF4444" });
        if (critical > 0) data.push({ name: "Critical (<50%)", amount: critical, fill: "#F97316" });
        if (runningLow > 0) data.push({ name: "Running Low (<100%)", amount: runningLow, fill: "#EAB308" });
        if (healthy > 0) data.push({ name: "Healthy (100%+)", amount: healthy, fill: "#22C55E" });

        return {
            chartData: data,
            stats: { outOfStock, critical, runningLow, healthy }
        };
    }, [tableItems]);

    const chartConfig = useMemo(() => {
        return {
            amount: { label: "Items" },
            "Out of Stock": { label: "Out of Stock", color: "#EF4444" },
            "Critical (<50%)": { label: "Critical", color: "#F97316" },
            "Running Low (<100%)": { label: "Running Low", color: "#EAB308" },
            "Healthy (100%+)": { label: "Healthy", color: "#22C55E" },
        } satisfies ChartConfig;
    }, []);

    const handleSaveChanges = () => {
        if (tempTableId) {
            setSelectedTableId(tempTableId);
            localStorage.setItem("preferredPieChartTable", tempTableId);
        }
        setOpen(false);
    };

    // FIX: Safely check if the selected table actually exists in the database
    const currentTable = tables?.find((t: any) => t._id === selectedTableId);
    const currentTableName = isTablesLoading ? "Loading..." : (currentTable?.name || "None Selected");

    // FIX: Bulletproof logic for the bottom status text
    let StatusIcon = CheckCircle2;
    let iconColor = "text-green-500";
    let statusText = "All items are at healthy stock levels.";

    if (isTablesLoading) {
        StatusIcon = Info;
        iconColor = "text-neutral-500";
        statusText = "Loading table data...";
    } else if (!currentTable) {
        StatusIcon = Info;
        iconColor = "text-neutral-500";
        statusText = "No tables selected yet.";
    } else if (stats.outOfStock > 0) {
        StatusIcon = AlertCircle;
        iconColor = "text-red-500";
        statusText = `Attention: ${stats.outOfStock} item(s) are completely out of stock.`;
    } else if (stats.critical > 0) {
        StatusIcon = AlertTriangle;
        iconColor = "text-orange-500";
        statusText = `${stats.critical} item(s) are at critically low levels.`;
    } else if (stats.runningLow > 0) {
        StatusIcon = Info;
        iconColor = "text-yellow-500";
        statusText = `${stats.runningLow} item(s) are running below par level.`;
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
                                        return (
                                            <div
                                                key={table._id}
                                                className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-neutral-800 rounded-[0.625rem] p-6 items-center ${isSelected
                                                    ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white"
                                                    : "bg-neutral-300 text-neutral-900"
                                                    }`}
                                                onClick={() => setTempTableId(table._id)}
                                            >
                                                <span className={`text-sm ${isSelected ? "text-white" : "text-neutral-900"}`}>{index + 1}.</span>
                                                <span className="font-medium">{table.name}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button type="button" className="cursor-pointer" onClick={handleSaveChanges}>Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="flex-1 pb-4 mt-4">
                {isLoading || isTablesLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Skeleton className="h-[200px] w-[200px] rounded-full bg-neutral-800" />
                    </div>
                ) : !currentTable ? (
                    <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                        Please select a table to view data.
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                        No active stock found in this table.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie data={chartData} dataKey="amount" nameKey="name" innerRadius={60} strokeWidth={2}>
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
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