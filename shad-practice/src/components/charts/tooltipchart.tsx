import { useState, useMemo, useEffect } from "react";
import { Bar, BarChart, XAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart"
import { useQuery } from "@tanstack/react-query";
import EditIcon from '@mui/icons-material/Edit';
import { TrendingDown, CheckCircle2 } from "lucide-react";
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

export const description = "A bar chart showing Current Stock vs Par Level"

export function ToolTipCosh() {
    const [open, setOpen] = useState(false);

    const [selectedTableId, setSelectedTableId] = useState<string | null>(() => {
        return localStorage.getItem("preferredBarChartTable") || null;
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
            localStorage.setItem("preferredBarChartTable", firstTableId);
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

    const chartData = useMemo(() => {
        if (!tableItems) return [];

        return tableItems
            .map((item: any) => {
                const stock = item.currentStock !== undefined ? item.currentStock : (item.inStock || 0);
                const par = item.parLevel || 0;
                const percent = par > 0 ? (stock / par) * 100 : 100;

                return {
                    item: item.name,
                    currentStock: stock,
                    parLevel: par,
                    percent: percent
                };
            })
            .filter((item: any) => item.parLevel > 0)
            .sort((a: any, b: any) => a.percent - b.percent)
            .slice(0, 5);
    }, [tableItems]);

    const chartConfig = {
        parLevel: { label: "Par Goal", color: "#94a3b8" },
        currentStock: { label: "Current Stock", color: "#3b82f6" },
    } satisfies ChartConfig;

    const currentTableName = tables?.find((t: any) => t._id === selectedTableId)?.name || "Loading...";

    const handleSaveChanges = () => {
        if (tempTableId) {
            setSelectedTableId(tempTableId);
            localStorage.setItem("preferredBarChartTable", tempTableId);
        }
        setOpen(false);
    };

    // Determine dynamic description for the bar chart
    let StatusIcon = CheckCircle2;
    let iconColor = "text-green-500";
    let statusText = "No critical restock needs at the moment.";

    if (chartData.length > 0) {
        const worstOffender = chartData[0];
        if (worstOffender.percent < 100) {
            StatusIcon = TrendingDown;
            iconColor = "text-red-500";
            statusText = `Action needed: ${worstOffender.item} is at ${Math.round(worstOffender.percent)}% of par goal.`;
        }
    }

    return (
        <Card className="flex flex-col h-full w-full min-h-[400px] relative">
            <CardHeader className="items-start pb-0 pr-12">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <CardTitle>Most Critical Restock Needs</CardTitle>
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
                    {/* ... (Keep existing DialogContent identical to previous code) ... */}
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Table Source</DialogTitle>
                            <DialogDescription className="flex flex-col items-start">
                                Choose which table's critical inventory you want to display.
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

            <CardContent className="flex-1 pb-4 mt-8">
                {isLoading ? (
                    <div className="h-[200px] w-full flex items-end gap-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="w-full bg-neutral-800" style={{ height: `${Math.random() * 80 + 20}%` }} />
                        ))}
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm">
                        <p>No critical items found.</p>
                        <p className="text-xs mt-1">(Or items are missing Par Levels)</p>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="item" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="parLevel" fill="var(--color-parLevel)" radius={[4, 4, 0, 0]} name="Par Goal" />
                            <Bar dataKey="currentStock" fill="var(--color-currentStock)" radius={[4, 4, 0, 0]} name="Current Stock" />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>

            {/* NEW FOOTER WITH DYNAMIC DESCRIPTION */}
            <CardFooter className="flex-col gap-2 text-sm text-center border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    <StatusIcon className={`w-4 h-4 ${iconColor}`} />
                    {statusText}
                </div>
                <div className="leading-none text-muted-foreground">
                    Displaying the top 5 items furthest below their par levels.
                </div>
            </CardFooter>
        </Card>
    )
}