import { useState } from "react";
import { useEffect } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../ui/dialog";
import { Button } from "@/components/ui/button";
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface InventoryTable {
    _id: string,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url: string,
    itemCount?: number, // Added to support the item count badge
    items?: any[]       // Fallback property
}

interface SelectedItem {
    _id: string,
    tableId: string
}

interface AddTileProps {
    onSaveSuccess: () => void;
    isLimitReached: boolean;
}

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-lg bg-neutral-800/50 ${className}`} />
    );
}

export default function AddTile({ onSaveSuccess, isLimitReached }: AddTileProps) {
    const [tables, setTables] = useState<InventoryTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [tableOpen, setTableOpen] = useState(false);
    const [rows, setRows] = useState<any[]>([])
    const { id } = useParams();
    const [tableID, setTableId] = useState<string | undefined>();
    const [isItemsLoading, setIsItemsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

    useEffect(() => {
        const fetchTables = async () => {
            const token = localStorage.getItem("token")
            try {
                const res = await fetch('https://coshts-backend.vercel.app/api/tables', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("failed to fetch on add-tile");

                const data = await res.json();
                setTables(data);
            } catch (error) {
                console.log("Error loading fetchTables on Add-Tile", error)
            } finally {
                setIsLoading(false);
            }
        }
        fetchTables()
    }, [])

    useEffect(() => {
        const fetchTableItems = async () => {
            const token = localStorage.getItem("token")
            if (!tableID) return;
            setIsItemsLoading(true);
            try {
                const res = await fetch(`https://coshts-backend.vercel.app/api/items/${tableID}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch items");
                const data = await res.json();
                setRows(data);
            } catch (error) {
                console.error("Error loading items:", error);
            } finally {
                setIsItemsLoading(false);
            }
        };
        fetchTableItems();
    }, [tableID]);

    const uploadItemTableID = async (itemID: any, itemTableID: any) => {
        const token = localStorage.getItem("token")
        try {
            const res = await fetch('https://coshts-backend.vercel.app/api/tileItems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemId: itemID,
                    tableId: itemTableID
                }),
            })

            if (!res.ok) {
                throw new Error("Failed to save add item item");
            } else {
                console.log("Pogg add-tile item worked!")
            }
        } catch (error) {
            console.error("Error on Add Tile Uploading To DB", error)
        }
    }

    const saveAll = async () => {
        setIsSaving(true);
        try {
            for (const item of selectedItems) {
                await uploadItemTableID(item._id, item.tableId)
            }
            onSaveSuccess();
            setSelectedItems([]);
            setTableOpen(false);
            setOpen(false);
        } catch (error) {
            console.error("Failed to save items", error);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLimitReached) {
        return (
            <div className="flex flex-col justify-center items-center border-neutral-800 border-2 border-dashed h-64 w-full rounded-[0.625rem] bg-neutral-900/50 opacity-70 cursor-not-allowed p-4">
                <h5 className="text-neutral-400 text-center font-medium">
                    Tile Limit Exceeded <br />
                    <span className="text-xs text-neutral-500 font-normal mt-2 block">Please clear tiles to add more.</span>
                </h5>
            </div>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setSelectedItems([]); setTableOpen(false) } }}>
                <DialogTrigger asChild>
                    <div className="hover:brightness-125 transition duration-200 ease-in-out relative flex flex-col justify-center items-center border-white/10 border-1 h-64 w-full rounded-[0.625rem] bg-neutral-900 cursor-pointer">
                        <AddIcon sx={{ fontSize: 64, }} color="primary" />
                        <h5 className="text-neutral-50 text-center">Add more <br /> item reminder</h5>
                    </div>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add Item Reminder
                        </DialogTitle>
                        <DialogDescription className="flex flex-col items-start">
                            Choose a table and item that you deem very important to watch! <br />
                            <span className="">Tables Available: {tables.length}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className={tableOpen ? "block flex" : "hidden"}>
                        <Button className="ml-auto cursor-pointer" onClick={() => setTableOpen(false)}>Go Back</Button>
                    </div>
                    <div className="h-64 border-white/10 border-1 rounded-[0.625rem] p-4 overflow-y-auto">
                        <div className={tableOpen ? "hidden" : "block flex flex-col gap-y-2 "}>
                            {isLoading ? ([...Array(3)].map((_, i) => (<Skeleton key={i} className="h-[74px] w-full" />))) : (
                                tables.length === 0 ? (<div className="flex justify-center items-center h-full min-h-[200px]"><span className="text-neutral-500">No tables found!</span></div>) : tables.map((table, index) => {
                                    // Fetch count dynamically
                                    const count = table.itemCount ?? table.items?.length ?? '?';

                                    return (
                                        <div
                                            key={table._id}
                                            className="cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row justify-between border border-neutral-800 rounded-[0.625rem] bg-neutral-300 p-6 items-center"
                                            onClick={() => { setTableId(table._id); setTableOpen(true) }}
                                        >
                                            <div className="flex gap-x-4 items-center">
                                                <span className="text-sm text-neutral-900">{index + 1}.</span>
                                                <span className="font-medium text-neutral-900">{table.name}</span>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-neutral-400/50 text-neutral-800">
                                                {count} items
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        <div className={tableOpen ? "block flex flex-col gap-y-2 " : "hidden"}>
                            {isItemsLoading ? ([...Array(3)].map((_, i) => (<Skeleton key={i} className="h-[74px] w-full" />))) : (
                                rows.length === 0 ? (<div className="flex justify-center items-center h-full min-h-[200px]"><span className="text-neutral-500">No items found!</span></div>) : rows.map((item, index) => {
                                    const isItemSelected = selectedItems.some((sel) => sel._id === item._id);
                                    return (
                                        <div key={item._id} className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-neutral-800 rounded-[0.625rem] ${isItemSelected ? "bg-linear-to-t from-sky-500 to-indigo-500 text-foreground" : "bg-neutral-300 border border-neutral-800"} p-6 items-center`} onClick={() => isItemSelected ? setSelectedItems(selectedItems.filter((sel) => sel._id !== item._id)) : setSelectedItems([...selectedItems, { _id: item._id, tableId: item.tableId }])}>
                                            <span className={`text-sm ${isItemSelected ? "text-foreground" : "text-neutral-900"}`}>{index + 1}.</span>
                                            <span className={`font-medium ${isItemSelected ? "text-foreground" : "text-neutral-900"}`}>{item.name}</span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => { setOpen(false), setTableOpen(false), setSelectedItems([]) }}>Cancel</Button>
                        </DialogClose>

                        {/* Inlined Confirmation Modal (Previously <AreYouSure />) */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" className="cursor-pointer">Save changes</Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Confirm Tile Choices
                                    </DialogTitle>
                                    <DialogDescription>
                                        Are you sure with your choices?
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="cursor-pointer" disabled={isSaving}>Cancel</Button>
                                    </DialogClose>

                                    <Button type="button" className="cursor-pointer" onClick={saveAll} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin inline" />
                                            </>
                                        ) : (
                                            "Save changes"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}