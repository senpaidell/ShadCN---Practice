import { Button } from "../ui/button";
import {
    Sheet,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { CreateTable } from "./inventory-buttons/create-table";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../ui/dialog";
import { Input } from "../ui/input";

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
        <div className={`animate-pulse rounded-md bg-neutral-300/50 ${className}`} />
    );
}

export function InventoryPage() {
    const queryClient = useQueryClient();

    // Create Status State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [statusMessage, setStatusMessage] = useState("");

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<InventoryTable | null>(null);
    const [newTableName, setNewTableName] = useState("");

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTable, setDeletingTable] = useState<InventoryTable | null>(null);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // --- FETCH QUERY ---
    const { data: tables = [], isLoading } = useQuery<InventoryTable[]>({
        queryKey: ['tables'],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch('https://coshts-backend.vercel.app/api/tables', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(tables.length / ITEMS_PER_PAGE);
    // Ensure we don't land on an empty page if the last item of a page is deleted
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const currentTables = tables.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // --- CREATE MUTATION ---
    const createMutation = useMutation({
        mutationFn: async (formData: { name: string, attributes: string[] }) => {
            const token = localStorage.getItem("token");
            const res = await fetch('https://coshts-backend.vercel.app/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("Failed to save data");
            return res.json();
        },
        onSuccess: (newTable) => {
            queryClient.setQueryData(['tables'], (old: InventoryTable[] | undefined) => [newTable, ...(old || [])]);
            setSaveStatus('success');
            setStatusMessage(`${newTable.name} has been created successfully.`);
            // Optional: reset to page 1 to see the newly created table
            setCurrentPage(1);
        },
        onError: () => {
            setSaveStatus('error');
            setStatusMessage("We couldn't save your table. Please check your connection.");
        }
    });

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

        createMutation.mutate({ name: formData.tableName, attributes: formData.attributes });
        return true;
    };

    // --- EDIT MUTATION ---
    const editMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string, name: string }) => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error("Failed to update table");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.setQueryData(['tables'], (old: InventoryTable[] | undefined) =>
                old?.map(t => t._id === variables.id ? { ...t, name: variables.name } : t)
            );
            toast.success("Table name updated successfully.");
            setIsEditModalOpen(false);
        },
        onError: () => {
            toast.error("Failed to update table name.");
        }
    });

    const openEditModal = (e: React.MouseEvent, table: InventoryTable) => {
        e.preventDefault();
        setEditingTable(table);
        setNewTableName(table.name);
        setIsEditModalOpen(true);
    };

    const handleEditTable = () => {
        if (!editingTable || !newTableName.trim()) return;
        editMutation.mutate({ id: editingTable._id, name: newTableName });
    };

    // --- DELETE MUTATION ---
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete table");
            return id;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData(['tables'], (old: InventoryTable[] | undefined) =>
                old?.filter(t => t._id !== deletedId)
            );
            toast.success("Table and all contents deleted successfully.");
            setIsDeleteModalOpen(false);
        },
        onError: () => {
            toast.error("Failed to delete the table.");
        }
    });

    const openDeleteModal = (e: React.MouseEvent, table: InventoryTable) => {
        e.preventDefault();
        setDeletingTable(table);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteTable = () => {
        if (!deletingTable) return;
        deleteMutation.mutate(deletingTable._id);
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
                        <span className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[14px]">{isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : tables.length}</span>
                    </div>
                </div>

                <div className="tableLoc flex flex-col gap-y-4">
                    {isLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-row gap-x-4 border border-white/5 rounded-[0.625rem] bg-neutral-300 p-10 items-center w-full">
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
                        currentTables.map((item, index) => (
                            <Link key={item._id} to={`/table/${item._id}`} className="group">
                                <div className="cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-neutral-800 rounded-[0.625rem] bg-neutral-300 p-10 items-center">
                                    <div className="text-sm text-neutral-900">{startIndex + index + 1}.</div>
                                    <Sheet className="w-6 h-6 text-neutral-300" />

                                    <div className="flex-1 flex items-start gap-x-4">
                                        <span className="text-lg font-medium text-neutral-900">{item.name}</span>
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

                                    <span className="ml-auto text-neutral-600 text-sm">
                                        Created: {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* PAGINATION CONTROLS */}
                {tables.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safeCurrentPage === 1}
                            className="cursor-pointer"
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-neutral-900 font-medium">
                            Page {safeCurrentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage === totalPages}
                            className="cursor-pointer"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Existing Create Status Dialog */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {saveStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                            {saveStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {saveStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {saveStatus === 'loading' ? "Processing..." : saveStatus === 'success' ? "Success!" : "Error"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-neutral-900 text-sm">{statusMessage}</p>
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
                <DialogContent className="sm:max-w-[425px] bg-neutral-100 border-neutral-800">
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
                            className="bg-neutral-200 border-neutral-700 text-black"
                            placeholder="Table Name"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={editMutation.isPending}>Cancel</Button>
                        <Button onClick={handleEditTable} disabled={editMutation.isPending || !newTableName.trim()}>
                            {editMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE MODAL */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-neutral-200 border-red-900/50">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-neutral-800">
                            Are you absolutely sure you want to delete <span className="text-black font-bold">{deletingTable?.name}</span>?
                            This action cannot be undone. <span className="text-red-400">All inventory items inside this table will be permanently deleted.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={deleteMutation.isPending}>Cancel</Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-black" onClick={handleDeleteTable} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (<span className="text-white">Yes, delete table</span>)}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}