import { Button } from "../ui/button"
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { PieChartComponent } from "../charts/piechart";
import { ToolTipCosh } from "../charts/tooltipchart";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QuickMode } from "./quickmode";
import { useEffect, useState } from "react";
import AddTile from "./buttons/add-tile";
import { Skeleton } from "../ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Loader2 } from "lucide-react";

let inStock = 4;
let maxStock = 8;

const percentageCalc = (num1: number, num2: number) => {
    let a = num1 / num2
    return Math.round(a * 100);
}

interface InventoryTable {
    _id: String,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url: string
}

export function HomePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const hours = new Date().getHours();
    const [tileToDelete, setTileToDelete] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/users/getusers", {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to Fetch Users Table");
            return res.json();
        }
    });

    const deleteTileMutation = useMutation({
        mutationFn: async (tileId: string) => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/tileItems/${tileId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to delete tile");
            }

            const responseText = await res.text();
            return responseText ? JSON.parse(responseText) : {};
        },
        onSuccess: () => {
            fetchTileItems();
            console.log("onSuccess Activated")
        },
        onError: (error) => {
            console.error("Delete mutation error:", error);
        },
        onSettled: () => {
            setTileToDelete(null);
            console.log("onSettled Activated")
        }
    });

    const { data: tables } = useQuery<InventoryTable[]>({
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
        if (!id && tables && tables.length > 0) {
            navigate(`/dashboard/${tables[0]._id}`);
        }
    }, [id, tables, navigate]);

    const { data: tableData } = useQuery({
        queryKey: ["tableDetails", id],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch table details");
            return res.json();
        },
        enabled: !!id
    });

    const { data: tableItems } = useQuery({
        queryKey: ["tableItems", id],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch items");
            return res.json();
        },
        enabled: !!id
    });

    const { data: tileItems, refetch: fetchTileItems, isLoading: isLoadingTiles } = useQuery({
        queryKey: ["tileItems"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/tileItems", {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to get Tile Items");
            return res.json();
        }
    });

    const tilesRemaining = Array.isArray(tileItems) ? tileItems
        .filter((item) => item.itemId !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((item) => {
            const inStock = item.itemId.currentStock || 0;
            const parLevel = item.itemId.parLevel;

            const isNoPar = !parLevel || parLevel === 0;
            const percentage = isNoPar ? Infinity : Math.round((inStock / parLevel) * 100);

            return {
                id: item._id,
                name: item.itemId?.name,
                percentage: percentage,
                currentStock: inStock,
                isNoPar: isNoPar,
                table: item.tableId?.name
            }
        }) : [];

    return (
        <>
            <div className="w-full sm:p-10 p-2 flex flex-col gap-y-4 overflow-hidden">
                <div>
                    <div className="text-3xl font-bold">
                        {hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening"}, {users ? `${users.firstName}` : "User"}!
                    </div>
                </div>

                <div className="flex flex-row items-center">
                    <h5 className="text-neutral-400 sm:text-sm text-[12px]">Remaining Items Left</h5>

                    <div className="ml-auto flex items-center gap-4">
                        <h5 className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[10px] sm:text-[14px]">{isLoadingTiles ? <Loader2 className="w-3 h-3 animate-spin inline" /> : `${tilesRemaining.length} / 10`}</h5>
                        <Link to={`/quickmode/${id}`}>
                            <Button className="cursor-pointer">Quick Mode</Button>
                        </Link>
                    </div>
                </div>

                <div className="itemsRemaining flex flex-col xl:flex-row gap-4 w-full">

                    <div className="itemsRemaining flex flex-col xl:flex-row gap-4 w-full">

                        <div className="relative flex-grow min-w-0 w-full">
                            <Carousel
                                opts={{
                                    align: "start",
                                    dragFree: true
                                }}
                                className="w-full cursor-grab active:cursor-grabbing"
                            >
                                <CarouselContent className="-ml-4">
                                    {isLoadingTiles ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4 min-w-[280px]">
                                                <Skeleton className="h-64 w-full rounded-[0.625rem] bg-neutral-800" />
                                            </CarouselItem>
                                        ))
                                    ) : (
                                        <>
                                            {/* Render the actual populated tiles (Now sorted newest first) */}
                                            {tilesRemaining.map((items) => (
                                                <CarouselItem key={items.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4 min-w-[280px]">
                                                    <div className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out relative h-64 w-full rounded-[0.625rem] 
                                                            ${items.isNoPar
                                                            ? "bg-neutral-600"
                                                            : items.percentage >= 50 && items.percentage <= 100
                                                                ? "bg-linear-to-t from-emerald-400 to-emerald-800"
                                                                : (items.percentage > 100 ? "bg-linear-to-t from-sky-500 to-indigo-700" : "bg-linear-to-t from-purple-500 to-pink-700")
                                                        }`}>

                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTileToDelete(items.id);
                                                        }} className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white hover:bg-red-500 transition z-20 cursor-pointer">
                                                            <CloseIcon fontSize="small" />
                                                        </button>

                                                        <span className="p-4 absolute top-0 left-0 text-sm font-semibold text-neutral-200">
                                                            <span className="text-neutral-400">Table: </span>{items.table}
                                                        </span>
                                                        <span className={`p-4 absolute bottom-0 left-0 ${items.name?.length > 8 ? 'text-sm' : 'text-xl'} font-bold text-neutral-100`}>
                                                            {items.name}
                                                        </span>
                                                        <span className="p-4 absolute bottom-8 left-0 text-5xl font-bold text-neutral-200">
                                                            {items.isNoPar ? `${items.currentStock} / 0` : `${items.percentage}%`}
                                                        </span>
                                                        <span className={`p-4 absolute bottom-0 right-0 text-3xl font-bold text-neutral-200`}>
                                                            {items.isNoPar ? (
                                                                <span className="p-2 bg-white rounded-[0.625rem] text-sm border border-zinc-700 text-neutral-600">
                                                                    No Par Level
                                                                </span>
                                                            ) : items.percentage >= 50 && items.percentage <= 100 ? (
                                                                <span className="p-2 bg-white rounded-[0.625rem] text-sm border border-green-600 text-green-600">
                                                                    Good
                                                                </span>
                                                            ) : items.percentage > 100 ? (
                                                                <span className="p-2 bg-white rounded-[0.625rem] text-sm border border-blue-600 text-blue-400">
                                                                    Over Stocked!
                                                                </span>
                                                            ) : (
                                                                <span className="p-2 bg-white rounded-[0.625rem] text-sm border border-red-600 text-red-600">
                                                                    Restock Now!
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </CarouselItem>
                                            ))}

                                            {/* Render empty placeholders for the remaining slots up to 10 */}
                                            {Array.from({ length: Math.max(0, 10 - tilesRemaining.length) }).map((_, index) => (
                                                <CarouselItem key={`empty-${index}`} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4 min-w-[280px]">
                                                    <div className="flex items-center justify-center h-64 w-full rounded-[0.625rem] border-2 border-dashed border-neutral-700 bg-neutral-800/30">
                                                        <span className="text-neutral-500 font-medium">
                                                            {tilesRemaining.length === 0 ? "No tiles added yet" : "Available slot"}
                                                        </span>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </>
                                    )}
                                </CarouselContent>
                                <CarouselPrevious className="absolute left-4 z-10 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white" />
                                <CarouselNext className="absolute right-4 z-10 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white" />
                            </Carousel>
                        </div>

                        <div className="flex-shrink-0 w-full xl:w-[280px]">
                            <AddTile onSaveSuccess={fetchTileItems} isLimitReached={tilesRemaining.length >= 10} />
                        </div>

                    </div>
                </div>

                <div className="charts grid grid-cols-1 lg:grid-cols-2 gap-4 w-full mt-4">
                    <PieChartComponent />
                    <ToolTipCosh />
                </div>
            </div>

            <Dialog open={!!tileToDelete} onOpenChange={(open) => !open && setTileToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Tile</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this inventory tile? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="cursor-pointer">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => tileToDelete && deleteTileMutation.mutate(tileToDelete)}
                            disabled={deleteTileMutation.isPending}
                        >
                            {deleteTileMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}