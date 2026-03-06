import { Button } from "../ui/button";
import { Sheet, Edit2, Trash2 } from "lucide-react"; // Imported new icons
import { CreateTable } from "./inventory-buttons/create-table";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface InventoryTable {
    _id: string;
    name: string;
    attributes: string[];
    icon: any;
    createdAt: string;
    url: string;
}

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-neutral-800/50 ${className}`} />
    );
}

export function InventoryPage() {
    const [tables, setTables] = useState<InventoryTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Create Status State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [statusMessage, setStatusMessage] = useState("");

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<InventoryTable | null>(null);
    const [newTableName, setNewTableName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTable, setDeletingTable] = useState<InventoryTable | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchTables = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch('https://coshts-backend.vercel.app/api/tables', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch");
                
                const data = await res.json();
                setTables(data);
            } catch (error) {
                console.error("Error loading tables:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTables();
    }, []);

    const handleSaveNewTable = async (formData: { tableName: string, attributes: string[] }) => {
        const token = localStorage.getItem("token");
        if (!token) return false;
            
        const isNameEmpty = !formData.tableName || formData.tableName.trim() === "";
        const isAttributesEmpty = !formData.attributes || formData.attributes.length === 0;

        if (isNameEmpty || isAttributesEmpty) {
            setSaveStatus('error');
            setStatusMessage(isNameEmpty ? "Please enter a table name." : "Please select at least one attribute.");
            setIsStatusModalOpen(true);
            return false; 
        }

        setIsStatusModalOpen(true);
        setSaveStatus('loading');
        setStatusMessage("Saving your new table...");

        try {
            const res = await fetch('https://coshts-backend.vercel.app/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: formData.tableName,
                    attributes: formData.attributes,
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

    // --- NEW EDIT LOGIC ---
    const openEditModal = (e: React.MouseEvent, table: InventoryTable) => {
        e.preventDefault(); // Prevents the Link from redirecting
        setEditingTable(table);
        setNewTableName(table.name);
        setIsEditModalOpen(true);
    };

    const handleEditTable = async () => {
        if (!editingTable || !newTableName.trim()) return;
        setIsEditing(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${editingTable._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newTableName })
            });

            if (!res.ok) throw new Error("Failed to update table");

            // Update UI State locally
            setTables((prev) => prev.map(t => t._id === editingTable._id ? { ...t, name: newTableName } : t));
            toast.success("Table name updated successfully.");
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error("Failed to update table name.");
        } finally {
            setIsEditing(false);
        }
    };

    // --- NEW DELETE LOGIC ---
    const openDeleteModal = (e: React.MouseEvent, table: InventoryTable) => {
        e.preventDefault(); // Prevents the Link from redirecting
        setDeletingTable(table);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteTable = async () => {
        if (!deletingTable) return;
        setIsDeleting(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${deletingTable._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete table");

            // Remove from UI
            setTables((prev) => prev.filter(t => t._id !== deletingTable._id));
            toast.success("Table and all contents deleted successfully.");
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Failed to delete the table.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* <Toaster richColors position="top-center" /> */}
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-8">
                <div className="manageTitle item-center">
                    <div className="flex flex-col gap-y-2">
                        <span className="text-3xl font-bold">Manage Inventory</span>
                    </div>
                    <h5 className="flex items-center description text-neutral-400">
                        Create a table first to manage your inventory.
                        <span className="ml-auto"><CreateTable onSave={handleSaveNewTable} /></span>
                    </h5>
                    <div>
                        <span className="text-neutral-400">Tables Created: </span> 
                        <span className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[14px]">{tables.length}</span>
                    </div>
                </div>
                
                <div className="tableLoc flex flex-col gap-y-4">
                    {isLoading ? (
                        [1,2,3,4].map((i) => (
                            <div key={i} className="flex flex-row gap-x-4 border border-white/5 rounded-[0.625rem] bg-neutral-900 p-10 items-center w-full">
                                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                                <div className="flex-1 flex flex-row gap-2">
                                    <Skeleton className="h-6 w-3/4 max-w-[300px]" />
                                </div>
                                <Skeleton className="h-4 w-24 shrink-0" />
                            </div>
                        ))
                    ) : tables.length === 0 ? (
                        <div className="text-neutral-500 text-center py-10 border border-dashed border-neutral-800 rounded-lg">
                            No inventory tables created yet.
                        </div>
                    ) : (
                        tables.map((item, index) => (
                            // Add 'group' here to trigger child visibility on hover
                            <Link key={item._id} to={`/table/${item._id}`} className="group">
                                <div className="cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-white/10 rounded-[0.625rem] bg-neutral-900 p-10 items-center">
                                    <div className="text-sm text-neutral-400">{index + 1}.</div>
                                    <Sheet className="w-6 h-6 text-neutral-300" />
                                    
                                    <div className="flex-1 flex items-start gap-x-4">
                                        <span className="text-lg font-medium">{item.name}</span>
                                    </div>
                                    
                                    {/* Action Buttons: Only visible on group hover */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            onClick={(e) => openEditModal(e, item)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={(e) => openDeleteModal(e, item)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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

            {/* Existing Create Status Dialog */}
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
                            <Button onClick={() => setIsStatusModalOpen(false)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
                    <DialogHeader>
                        <DialogTitle>Rename Table</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Enter a new name for your inventory table.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={newTableName} 
                            onChange={(e) => setNewTableName(e.target.value)} 
                            className="bg-neutral-800 border-neutral-700 text-white"
                            placeholder="Table Name"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isEditing}>Cancel</Button>
                        <Button onClick={handleEditTable} disabled={isEditing || !newTableName.trim()}>
                            {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE MODAL */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-red-900/50">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Are you absolutely sure you want to delete <span className="text-white font-bold">{deletingTable?.name}</span>? 
                            This action cannot be undone. <span className="text-red-400">All inventory items inside this table will be permanently deleted.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteTable} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete table"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}