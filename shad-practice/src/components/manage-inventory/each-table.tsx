import { Link, useParams } from "react-router-dom"
import { Button } from "../ui/button"
import { AddItem } from "./inventory-buttons/add-item"
import { FilterItem } from "./inventory-buttons/filter-item"
import { TableSelector } from "./inventory-buttons/table-selector"
import { useEffect, useState } from "react"
import { DataTable } from "./data-table/data-table"
import { createColumns, getDbKey } from "./data-table/columns" 
import { DataTableSkeleton } from "./data-table/data-table-skeleton"
import { Skeleton } from "../ui/skeleton"
import { Toaster, toast } from "sonner"
import { Input } from "../ui/input"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../ui/dialog";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface InventoryTable {
    _id: String,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url: string
}

export default function EachTable() {
    const [tables, setTables] = useState<InventoryTable[]>([])
    const { id } = useParams();
    const [tableData, setTableData] = useState<any>(null);
    const [rows, setRows] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true);
    
    // Status State
    const [saveStatus, setSaveStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [statusMessage, setStatusMessage] = useState("")
    const [isStatusModalOpen, setIsStatusModelOpen] = useState(false);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [isEditing, setIsEditing] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Single Table Data
    useEffect(() => {
        const token = localStorage.getItem("token")
        const fetchTableDetails = async () => {
            const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            setTableData(data)
        }

        if (id) {
            fetchTableDetails()
        }
    }, [id])

    // Fetch All Tables (For context/selector if needed)
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
                })
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setTables(data);
            } catch (error) {
                console.error("Error loading tables:", error)
            } finally {
                setIsLoading(false);
            }
        }
        fetchTables()
    }, [])

    // Fetch Items for this Table
    useEffect(() => {
        const fetchTableItems = async () => {
            const token = localStorage.getItem("token")
            try {
                const res = await fetch(`https://coshts-backend.vercel.app/api/items/${id}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) throw new Error("Failed to fetch items")
                
                const data = await res.json()
                setRows(data);
            } catch (error) {
                console.error("Error loading items:", error)
            }
        }

        if (id) {
            fetchTableItems()
        }
    }, [id])

    // --- CREATE HANDLER ---
    const handleSaveItem = async (itemData: any) => {
        const token = localStorage.getItem("token")
        
        setIsStatusModelOpen(true);
        setSaveStatus('loading');
        setStatusMessage("Saving your new item...");
        
        try {
            const res = await fetch('https://coshts-backend.vercel.app/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData),
            })

            if (!res.ok) throw new Error("Failed to save item");

            const newItem = await res.json();
            setRows((prev) => [...prev, newItem]);
            setSaveStatus('success');
            setStatusMessage('Item has been added successfully.');
            return true;
        } catch (error) {
            console.error("Error saving item:", error);
            setSaveStatus('error');
            setStatusMessage("We couldn't save your item. Please check your connection.")
            return false;
        }
    }

    // --- EDIT HANDLERS ---
    const openEditModal = (item: any) => {
        setEditingItem(item);
        
        const initialData: any = { name: item.name };
        const columnNames = tableData.attributes.map((attr: any) => attr.name);
        columnNames.forEach((attrName: string) => {
             if (attrName !== "Name") {
                 initialData[getDbKey(attrName)] = item[getDbKey(attrName)] || "";
             }
        });

        setEditFormData(initialData);
        setIsEditModalOpen(true);
    };

    const handleEditItem = async () => {
        if (!editingItem) return;
        setIsEditing(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/${editingItem._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editFormData)
            });

            if (!res.ok) throw new Error("Failed to update item");
            const updatedItem = await res.json();

            setRows((prev) => prev.map(r => r._id === updatedItem._id ? updatedItem : r));
            toast.success("Item updated successfully.");
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error("Failed to update item.");
        } finally {
            setIsEditing(false);
        }
    };

    // --- DELETE HANDLERS ---
    const openDeleteModal = (item: any) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteItem = async () => {
        if (!deletingItem) return;
        setIsDeleting(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://coshts-backend.vercel.app/api/items/${deletingItem._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete item");

            setRows((prev) => prev.filter(r => r._id !== deletingItem._id));
            toast.success("Item deleted successfully.");
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Failed to delete the item.");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- LOADING SCREENS & EARLY RETURNS ---
    if (!tableData) {
        return (
            <div className="w-screen sm:p-10 p-2 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-[250px] bg-neutral-800" />
                    <Skeleton className="h-10 w-[100px] bg-neutral-800" />
                </div>
                <DataTableSkeleton />
            </div>
        )
    }

    if (!rows) {
        return <DataTableSkeleton />
    }

    // --- RENDER TABLE ---
    const columnNames = tableData.attributes.map((attr: any) => attr.name);
    const columns = createColumns(columnNames, openEditModal, openDeleteModal);

    return (
        <>
            {/* <Toaster richColors position="top-center" /> */}
            <div className="flex flex-col gap-y-4 w-full sm:p-10 p-2 overflow-hidden">
                
                {/* Header */}
                <div className="manageTitle item-center flex flex-col gap-y-2">
                    <div className="flex flex-row">
                        <div className="text-3xl font-bold">Manage Inventory</div>
                        <div className="ml-auto">
                            <Link to="/inventory">
                                <Button className="cursor-pointer">
                                    Go Back
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex">
                        <span className="mr-auto">
                            <TableSelector />
                        </span>
                        <span className="ml-auto flex flex-row gap-x-2">
                            <span><FilterItem /></span>
                            <span><AddItem tableData={tableData} onSave={handleSaveItem} /></span>
                        </span> 
                    </div>
                
                    <h5 className="flex items-center description text-neutral-400">
                        Create a table first to manage your inventory.
                    </h5>
                </div>

                {/* Data Table */}
                <div>
                    <DataTable columns={columns} data={rows} />
                </div>

                {/* Status Dialog */}
                <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModelOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {saveStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500"/>}
                                {saveStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500"/>}
                                {saveStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500"/>}
                                {saveStatus === 'loading' ? "Processing..." : saveStatus === 'success' ? "Success!" : "Error"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <p className="text-neutral-400 text-sm">{statusMessage}</p>
                        </div>

                        <DialogFooter>
                            {saveStatus !== 'loading' && (
                                <Button onClick={() => setIsStatusModelOpen(false)} className="cursor-pointer">Close</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Item Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Update the details of your inventory item.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Item Name</label>
                                <Input 
                                    value={editFormData.name || ""} 
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} 
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            
                            {columnNames.filter((name: string) => name !== "Name").map((attrName: string) => {
                                const dbKey = getDbKey(attrName);
                                return (
                                    <div key={dbKey} className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">{attrName}</label>
                                        <Input 
                                            type={dbKey.includes("Stock") || dbKey === "volume" ? "number" : "text"}
                                            value={editFormData[dbKey] || ""} 
                                            onChange={(e) => setEditFormData({ ...editFormData, [dbKey]: e.target.value })} 
                                            className="bg-neutral-800 border-neutral-700 text-white"
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isEditing}>Cancel</Button>
                            <Button onClick={handleEditItem} disabled={isEditing || !editFormData.name?.trim()}>
                                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Item Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-red-900/50">
                        <DialogHeader>
                            <DialogTitle className="text-red-500 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" /> Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-neutral-400 mt-2">
                                Are you sure you want to delete <span className="text-white font-bold">{deletingItem?.name}</span>? 
                                This action cannot be undone and will remove it from the table permanently.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteItem} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete item"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    )
}