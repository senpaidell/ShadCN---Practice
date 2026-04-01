import { Button } from "../ui/button"
import { Link } from "react-router-dom";
import { Image, Minus, Plus, ArrowRight, Loader2 } from "lucide-react"; // Added ArrowRight & Loader2
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription // Added DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Import your audit hook (Adjust the path if necessary)
import { useLogAudit } from "@/hooks/useLogAudit";

interface InventoryTable {
    _id: string,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url: string
}

// --- 1. TABLE GROUP COMPONENT ---
function TableGroup({ table }: { table: InventoryTable }) {
    const queryClient = useQueryClient();
    const logAudit = useLogAudit();

    // Modal State
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [actionType, setActionType] = useState<"in" | "out">("in");
    const [quantity, setQuantity] = useState<number | string>(1);
    const [isUpdating, setIsUpdating] = useState(false);

    const { data: localItems = [], isLoading } = useQuery({
        queryKey: ['items', table._id],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/${table._id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Error fetching items for table");
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // Handle opening the modal and resetting state
    const openModal = (item: any) => {
        setSelectedItem(item);
        setActionType("in"); // Default to Stock In
        setQuantity(1);
    };

    const handleClose = () => {
        setSelectedItem(null);
        setIsUpdating(false);
    };

    // Handle the actual database update
    const handleConfirm = async () => {
        if (!selectedItem) return;
        setIsUpdating(true);

        try {
            const token = localStorage.getItem("token");

            // NOTE: You may need to adjust the URL and payload to match your exact backend controller logic
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/${selectedItem._id}/stock`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: actionType, // "in" or "out"
                    quantity: Number(quantity)
                })
            });

            if (!res.ok) throw new Error("Failed to update stock");

            // 1. Invalidate queries to refresh the UI if necessary
            queryClient.invalidateQueries({ queryKey: ['items', table._id] });

            // 2. Log the activity using your hook
            logAudit.mutate({
                targetName: selectedItem.name,
                tableName: table.name,
                activity: actionType === "in" ? "Item Added" : "Item Subtracted"
            });

            // 3. Close the modal
            handleClose();

        } catch (error) {
            console.error("Error updating stock:", error);
            // Handle error state/toast notification here if needed
        } finally {
            setIsUpdating(false);
        }
    };

    // --- REAL-TIME STOCK MATH ---
    const currentStockVal = selectedItem?.currentStock || 0;
    const numQuantity = Number(quantity) || 0;
    const projectedStock = actionType === "in" ? currentStockVal + numQuantity : currentStockVal - numQuantity;

    return (
        <div className="border border-neutral-800 p-4 rounded-[0.625rem] w-full overflow-hidden">
            <span className="text-lg font-bold">{table.name}</span>

            <div className="mt-4 relative px-10 sm:px-14 w-full">
                <Carousel
                    opts={{ align: "start", dragFree: true }}
                    className="w-full cursor-grab active:cursor-grabbing"
                >
                    <CarouselContent className="-ml-2">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <CarouselItem key={index} className="pl-2 basis-auto">
                                    <Skeleton
                                        className="h-[12vh] w-[12vh] shrink-0 border-1 border-neutral-800 rounded-[0.625rem] bg-neutral-900"
                                    />
                                </CarouselItem>
                            ))
                        ) : localItems.length === 0 ? (
                            <div className="text-neutral-500 text-sm ml-4">No items found.</div>
                        ) : (
                            localItems.map((item: any) => (
                                <CarouselItem key={item._id} className="pl-2 basis-auto">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="flex flex-col hover:brightness-125 transition-all cursor-pointer h-[12vh] w-[12vh] shrink-0 border-1 flex justify-center items-center border-neutral-800 rounded-[0.625rem] bg-neutral-300 text-black"
                                    >
                                        <div><Image size={32} /></div>
                                        <div className="mt-2 text-sm font-semibold text-center px-1 truncate w-full">
                                            {item.name}
                                        </div>
                                    </button>
                                </CarouselItem>
                            ))
                        )}
                    </CarouselContent>

                    {!isLoading && localItems.length > 0 && (
                        <>
                            <CarouselPrevious className="absolute -left-10 sm:-left-14 z-10 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white" />
                            <CarouselNext className="absolute -right-10 sm:-right-14 z-10 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white" />
                        </>
                    )}
                </Carousel>
            </div>

            {/* LIGHT MODE STOCK MODAL WITH REAL-TIME PREVIEW */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-[450px] bg-white border-gray-200 text-black">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">
                            {selectedItem?.name}
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-500 mt-1">
                            Adjust the inventory levels for this item.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Real-time Math Preview Box */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 mb-2">
                        <div className="flex justify-between items-center text-center">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Current</span>
                                <span className="text-2xl font-bold text-gray-700">{currentStockVal}</span>
                            </div>

                            <div className="text-gray-400 px-2">
                                {actionType === "in" ? <Plus className="h-6 w-6 text-green-600" /> : <Minus className="h-6 w-6 text-red-600" />}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Quantity</span>
                                <span className="text-2xl font-bold text-gray-700">{numQuantity}</span>
                            </div>

                            <div className="text-gray-400 px-2">
                                <ArrowRight className="h-6 w-6" />
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">New Stock</span>
                                <span className={`text-3xl font-bold ${projectedStock < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                    {projectedStock}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 py-2">
                        {/* Action Toggle */}
                        <div className="flex w-full rounded-md border border-gray-200 p-1 bg-gray-100">
                            <button
                                onClick={() => setActionType("in")}
                                className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all ${actionType === "in"
                                    ? "bg-white text-black shadow-sm border border-gray-200"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                Stock In
                            </button>
                            <button
                                onClick={() => setActionType("out")}
                                className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all ${actionType === "out"
                                    ? "bg-white text-black shadow-sm border border-gray-200"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                Stock Out
                            </button>
                        </div>

                        {/* Quantity Controller */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Enter Quantity</span>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 border-gray-300 text-black hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setQuantity(prev => Math.max(1, Number(prev) - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setQuantity(val === "" ? "" : parseInt(val, 10));
                                    }}
                                    onBlur={() => {
                                        if (quantity === "" || Number(quantity) < 1 || isNaN(Number(quantity))) {
                                            setQuantity(1);
                                        }
                                    }}
                                    className="h-12 w-24 text-center text-xl font-bold border-gray-300 bg-white text-black focus-visible:ring-gray-400 shadow-sm"
                                    min={1}
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 border-gray-300 text-black hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setQuantity(prev => Number(prev) + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button
                            className="w-full bg-black text-white hover:bg-gray-800 cursor-pointer py-6 text-md font-semibold"
                            onClick={handleConfirm}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            {isUpdating ? "Updating..." : "Confirm Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- 2. MAIN QUICKMODE COMPONENT ---
export function QuickMode() {
    const [pageTitle, setPageTitle] = useState("Mode");
    const [currentPage, setCurrentPage] = useState(1);
    const tablesPerPage = 3;

    const { data: tables = [], isLoading } = useQuery<InventoryTable[]>({
        queryKey: ['tables'],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/tables", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch tables");
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    const indexOfLastTable = currentPage * tablesPerPage;
    const indexOfFirstTable = indexOfLastTable - tablesPerPage;
    const currentTables = tables.slice(indexOfFirstTable, indexOfLastTable);
    const totalPages = Math.ceil(tables.length / tablesPerPage);

    return (
        <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-4 overflow-x-hidden">
            <div className="text-3xl font-bold">
                Quick Stock {pageTitle}
            </div>

            <div className="flex flex-row items-center">
                <h5 className="text-neutral-400">Click the item you made today for automatic deduction</h5>
                <Link to="/dashboard" className="ml-auto">
                    <Button variant="outline" className="cursor-pointer">Go Back to Home</Button>
                </Link>
            </div>

            <div className="flex w-full">
                <Tabs defaultValue="Stock Out" className="sm:ml-auto sm:w-96 w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="Stock In" className="cursor-pointer hover:brightness-125" onClick={() => setPageTitle("In")}>
                            Stock In
                        </TabsTrigger>
                        <TabsTrigger value="Stock Out" className="cursor-pointer hover:brightness-125" onClick={() => setPageTitle("Out")}>
                            Stock Out
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="min-h-[64vh] flex flex-col justify-between">
                <div className="flex flex-col gap-y-4 w-full">
                    {isLoading ? (
                        Array.from({ length: tablesPerPage }).map((_, index) => (
                            <div key={index} className="border border-neutral-800 p-4 rounded-[0.625rem] w-full">
                                <Skeleton className="h-7 w-48 bg-neutral-800 rounded-md" />
                                <div className="mt-4 px-10 sm:px-14 flex gap-2 overflow-hidden w-full">
                                    {Array.from({ length: 8 }).map((_, idx) => (
                                        <Skeleton
                                            key={idx}
                                            className="h-[12vh] w-[12vh] shrink-0 border-1 border-neutral-800 rounded-[0.625rem] bg-neutral-900"
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        currentTables.map((table) => (
                            <TableGroup key={table._id} table={table} />
                        ))
                    )}
                </div>

                {tables.length > 0 && !isLoading && (
                    <div className="flex justify-center items-center gap-x-4 mt-8 py-4">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-semibold">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}