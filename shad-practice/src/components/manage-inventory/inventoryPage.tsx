import { Button } from "../ui/button"
import { Sheet } from "lucide-react"
import { CreateTable } from "./inventory-buttons/create-table"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useEffect } from "react"
import { Toaster } from "../ui/sonner"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Loader2 } from "lucide-react"
import { CheckCircle2 } from "lucide-react"
import { AlertCircle } from "lucide-react"

interface InventoryTable{
    _id: string
    name: string
    attributes: string[]
    icon: any
    createdAt: string
    url: string
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-neutral-800/50 ${className}`} />
  );
}

export function InventoryPage() {
    const [tables, setTables] = useState<InventoryTable[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        console.log("useEffect is Running")
        const fetchTables = async () => {
            console.log("I am inside fetchTables")
            try {
                const res = await fetch('http://localhost:5000/api/tables')
                if (!res.ok) {
                    throw new Error("Failed to fetch");
                }
                
                const data = await res.json();
                setTables(data);
            } catch (error) {
                console.error("Error loading tables:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTables()
    }, [])




    const handleSaveNewTable = async (formData: { tableName: string, attributes: string[] }) => {
    const isNameEmpty = !formData.tableName || formData.tableName.trim() === "";
    const isAttributesEmpty = !formData.attributes || formData.attributes.length === 0;

    if (isNameEmpty || isAttributesEmpty) {
        setSaveStatus('error');
        const message = isNameEmpty ? "Please enter a table name." : "Please select at least one attribute.";
        setStatusMessage(message);
        setIsStatusModalOpen(true);
        return false; 
    }

    setIsStatusModalOpen(true);
    setSaveStatus('loading');
    setStatusMessage("Saving your new table...");

    try {
        const res = await fetch('http://localhost:5000/api/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.tableName,
                attributes: formData.attributes
            })
        });

        if (!res.ok) throw new Error("Failed to save data");

        const newTable = await res.json();
        setTables((prev) => [newTable, ...prev]);

        setSaveStatus('success');
        setStatusMessage(`${newTable.name} has been created successfully.`);
        return true; 
    } catch (error) {
        setSaveStatus('error');
        setStatusMessage("We couldn't save your table. Please check your connection.");
        return false;
    }
};

    return (
        <>
            <Toaster richColors position="top-center" />
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-8">
                <div className="manageTitle item-center">

                    <div className="flex flex-col gap-y-2">
                        <span className="text-3xl font-bold">Manage Inventory</span>
                    </div>

                    <h5 className="flex items-center description text-neutral-400">Create a table first to manage your inventory.

                        <span className="ml-auto"><CreateTable onSave={handleSaveNewTable} /></span>
                    </h5>
                </div>
                
                <div className="tableLoc flex flex-col gap-y-4">
                    {isLoading ? (
                        [1,2,3,4,5,6,7].map((i) => (
                    <div key={i} className="flex flex-row gap-x-4 border border-white/5 rounded-[0.625rem] bg-neutral-900 p-10 items-center w-full">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                        
                        <div className="flex-1 flex flex-row gap-2">
                            <Skeleton className="h-6 w-3/4 max-w-[300px]" />
                            {/* <Skeleton className="h-4 w-1/4 max-w-[150px]" /> */}
                        </div>
                        
                        <Skeleton className="h-4 w-24 shrink-0" />
                    </div>
                ))
                    ) : tables.length === 0 ? (
                    <div className="text-neutral-500 text-center py-10 border border-dashed border-neutral-800 rounded-lg">
                        No inventory tables created yet.
                    </div>
                    ) : (
                            tables.map((item) => (
                                <Link key={item._id} to={`/table/${item._id}`}>
                                    <div className="cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-white/10 rounded-[0.625rem] bg-neutral-900 p-10 items-center">
            
                                        <Sheet className="w-6 h-6 text-neutral-300" />
                                        
                                        <div className="flex-1 flex items-start gap-x-4">
                                            <span className="text-lg font-medium">{item.name}</span>
                                            {/* <span className="text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded mt-1">
                                                {item.attributes.length} columns
                                            </span> */}
                                        </div>
                                        
                                        <span className="ml-auto text-neutral-400 text-sm">
                                            Created: {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {saveStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                            {saveStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {saveStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {saveStatus === 'loading' ? "Processing..." : saveStatus === 'success' ? "Success!" : "Error"}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                    <p className="text-neutral-400 text-sm">{statusMessage}</p>
                    </div>

                    <DialogFooter>
                    {saveStatus !== 'loading' && (
                        <Button onClick={() => setIsStatusModalOpen(false)} className="cursor-pointer">
                        Close
                        </Button>
                    )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}