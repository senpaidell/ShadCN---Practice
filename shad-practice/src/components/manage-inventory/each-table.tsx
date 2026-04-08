import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Minus,
    Plus,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { createColumns, getDbKey } from "./data-table/columns";
import { DataTable } from "./data-table/data-table";
import { DataTableSkeleton } from "./data-table/data-table-skeleton";
import { AddItem } from "./inventory-buttons/add-item";
import { FilterItem } from "./inventory-buttons/filter-item";
import { TableSelector } from "./inventory-buttons/table-selector";

export default function EachTable() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    const [tableInstance, setTableInstance] = useState<any>(null);

    const [saveStatus, setSaveStatus] = useState<"loading" | "success" | "error">(
        "loading",
    );
    const [statusMessage, setStatusMessage] = useState("");
    const [isStatusModalOpen, setIsStatusModelOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockItem, setStockItem] = useState<any>(null);
    const [actionType, setActionType] = useState<"in" | "out">("in");
    const [quantity, setQuantity] = useState<number | string>(1);

    const { data: tableData, isLoading: isTableLoading } = useQuery({
        queryKey: ["table", id],
        queryFn: async () => {
            const res = await fetch(
                `https://coshts-backend.vercel.app/api/tables/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (!res.ok) throw new Error("Failed to fetch table details");
            return res.json();
        },
        enabled: !!id,
    });

    const { data: rows = [], isLoading: isItemsLoading } = useQuery({
        queryKey: ["items", id],
        queryFn: async () => {
            const res = await fetch(
                `https://coshts-backend.vercel.app/api/items/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (!res.ok) throw new Error("Failed to fetch items");
            return res.json();
        },
        enabled: !!id,
    });

    const createItemMutation = useMutation({
        mutationFn: async (itemData: any) => {
            const res = await fetch("https://coshts-backend.vercel.app/api/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(itemData),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save item");
            }
            return res.json();
        },
        onMutate: () => {
            setIsStatusModelOpen(true);
            setSaveStatus("loading");
            setStatusMessage("Saving your new item...");
        },
        onSuccess: (newItem) => {
            queryClient.setQueryData(["items", id], (oldData: any) => [
                ...(oldData || []),
                newItem,
            ]);
            setSaveStatus("success");
            setStatusMessage("Item has been added successfully.");
        },
        onError: (error: Error) => {
            setSaveStatus("error");
            setStatusMessage(error.message);
        },
    });

    const handleSaveItem = async (itemData: any) => {
        try {
            await createItemMutation.mutateAsync(itemData);
            return true;
        } catch {
            return false;
        }
    };

    const editItemMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(
                `https://coshts-backend.vercel.app/api/items/${editingItem._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editFormData),
                },
            );
            if (!res.ok) throw new Error("Failed to update item");
            return res.json();
        },
        onSuccess: (updatedItem) => {
            queryClient.setQueryData(["items", id], (oldData: any) =>
                oldData.map((r: any) => (r._id === updatedItem._id ? updatedItem : r)),
            );
            toast.success("Item updated successfully.");
            setIsEditModalOpen(false);
        },
        onError: () => toast.error("Failed to update item."),
    });

    const deleteItemMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(
                `https://coshts-backend.vercel.app/api/items/${deletingItem._id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!res.ok) throw new Error("Failed to delete item");
            return deletingItem._id;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData(["items", id], (oldData: any) =>
                oldData.filter((r: any) => r._id !== deletedId),
            );
            toast.success("Item deleted successfully.");
            setIsDeleteModalOpen(false);
        },
        onError: () => toast.error("Failed to delete the item."),
    });

    const stockItemMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(
                `https://coshts-backend.vercel.app/api/items/${stockItem._id}/stock`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: actionType,
                        quantity: Number(quantity),
                    }),
                },
            );
            if (!res.ok) throw new Error("Failed to update stock");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items", id] });
            toast.success("Stock updated successfully.");
            setIsStockModalOpen(false);
        },
        onError: () => toast.error("Failed to update stock."),
    });

    const handleEditItem = () => {
        if (!editingItem) return;
        editItemMutation.mutate();
    };

    const handleDeleteItem = () => {
        if (!deletingItem) return;
        deleteItemMutation.mutate();
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        const initialData: any = { name: item.name };
        const columnNames = tableData.attributes.map((attr: any) =>
            typeof attr === "string" ? attr : attr.name,
        );
        columnNames.forEach((attrName: string) => {
            if (attrName !== "Name") {
                initialData[getDbKey(attrName)] = item[getDbKey(attrName)] || "";
            }
        });
        setEditFormData(initialData);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (item: any) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    const openStockModal = (item: any) => {
        setStockItem(item);
        setActionType("in");
        setQuantity(1);
        setIsStockModalOpen(true);
    };

    const isEditing = editItemMutation.isPending;
    const isDeleting = deleteItemMutation.isPending;
    const isUpdatingStock = stockItemMutation.isPending;

    if (
        isTableLoading ||
        !tableData ||
        !tableData.attributes ||
        !Array.isArray(tableData.attributes)
    ) {
        return (
            <div className="w-screen sm:p-10 p-2 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-[250px] bg-neutral-800" />
                    <Skeleton className="h-10 w-[100px] bg-neutral-800" />
                </div>
                <DataTableSkeleton />
            </div>
        );
    }

    if (isItemsLoading || !rows) return <DataTableSkeleton />;

    const columnNames =
        tableData?.attributes.map((attr: any) =>
            typeof attr === "string" ? attr : attr.name,
        ) || [];
    const columns = createColumns(
        columnNames,
        openEditModal,
        openDeleteModal,
        openStockModal,
    );

    const currentStockVal = stockItem?.currentStock || 0;
    const numQuantity = Number(quantity) || 0;
    const projectedStock =
        actionType === "in"
            ? currentStockVal + numQuantity
            : currentStockVal - numQuantity;

    return (
        <>
            <div className="flex flex-col gap-y-4 w-full sm:p-10 p-2 overflow-hidden">
                <div className="manageTitle item-center flex flex-col gap-y-2">
                    <div className="flex flex-row">
                        <div className="text-3xl font-bold">Manage Inventory</div>
                        <div className="ml-auto">
                            <Link to="/inventory">
                                <Button className="cursor-pointer">Go Back</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex">
                        <span className="mr-auto">
                            <TableSelector />
                        </span>
                        <span className="ml-auto flex flex-row gap-x-2">
                            <span>
                                {tableInstance && (
                                    <FilterItem tableData={tableData} table={tableInstance} />
                                )}
                            </span>
                            <span>
                                <AddItem
                                    tableData={tableData}
                                    existingItems={rows}
                                    onSave={handleSaveItem}
                                />
                            </span>
                        </span>
                    </div>
                </div>

                <div>
                    <DataTable
                        columns={columns}
                        data={rows}
                        onTableInstance={setTableInstance}
                    />
                </div>

                <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModelOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 text-black">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {saveStatus === "loading" && (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                )}
                                {saveStatus === "success" && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                                {saveStatus === "error" && (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                                {saveStatus === "loading"
                                    ? "Processing..."
                                    : saveStatus === "success"
                                        ? "Success!"
                                        : "Error"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-gray-600 text-sm">{statusMessage}</p>
                        </div>
                        <DialogFooter>
                            {saveStatus !== "loading" && (
                                <Button
                                    onClick={() => setIsStatusModelOpen(false)}
                                    className="cursor-pointer bg-black text-white hover:bg-gray-800"
                                >
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 text-black">
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription className="text-gray-500">
                                Update the details of your inventory item.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Item Name
                                </label>
                                <Input
                                    value={editFormData.name || ""}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, name: e.target.value })
                                    }
                                    className="bg-white border-gray-300 text-black focus-visible:ring-gray-400"
                                />
                            </div>

                            {columnNames
                                .filter((name: string) => name !== "Name")
                                .map((attrName: string) => {
                                    const dbKey = getDbKey(attrName);
                                    return (
                                        <div key={dbKey} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                {attrName}
                                            </label>
                                            <Input
                                                type={
                                                    dbKey.includes("Stock") || dbKey === "volume"
                                                        ? "number"
                                                        : "text"
                                                }
                                                value={editFormData[dbKey] || ""}
                                                onChange={(e) =>
                                                    setEditFormData({
                                                        ...editFormData,
                                                        [dbKey]: e.target.value,
                                                    })
                                                }
                                                className="bg-white border-gray-300 text-black focus-visible:ring-gray-400"
                                            />
                                        </div>
                                    );
                                })}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isEditing}
                                className="bg-gray-200 text-black hover:bg-gray-300 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleEditItem()}
                                disabled={isEditing || !editFormData.name?.trim()}
                                className="bg-black text-white hover:bg-gray-800"
                            >
                                {isEditing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white border-red-200 text-black">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" /> Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 mt-2">
                                Are you sure you want to delete{" "}
                                <span className="text-black font-bold">
                                    {deletingItem?.name}
                                </span>
                                ? This action cannot be undone and will remove it from the table
                                permanently.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="bg-gray-200 text-black hover:bg-gray-300 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDeleteItem()}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Yes, delete item"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
                    <DialogContent className="sm:max-w-[450px] bg-white border-gray-200 text-black">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-center">
                                {stockItem?.name}
                            </DialogTitle>
                            <DialogDescription className="text-center text-gray-500 mt-1">
                                Adjust the inventory levels for this item.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 mb-2">
                            <div className="flex justify-between items-center text-center">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        Current
                                    </span>
                                    <span className="text-2xl font-bold text-gray-700">
                                        {currentStockVal}
                                    </span>
                                </div>
                                <div className="text-gray-400 px-2">
                                    {actionType === "in" ? (
                                        <Plus className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <Minus className="h-6 w-6 text-red-600" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        Quantity
                                    </span>
                                    <span className="text-2xl font-bold text-gray-700">
                                        {numQuantity}
                                    </span>
                                </div>
                                <div className="text-gray-400 px-2">
                                    <ArrowRight className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        New Stock
                                    </span>
                                    <span
                                        className={`text-3xl font-bold ${projectedStock < 0 ? "text-red-600" : "text-blue-600"}`}
                                    >
                                        {projectedStock}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 py-2">
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

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Enter Quantity
                                </span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 border-gray-300 text-black hover:bg-gray-100 cursor-pointer"
                                        onClick={() =>
                                            setQuantity((prev) => Math.max(1, Number(prev) - 1))
                                        }
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
                                            if (
                                                quantity === "" ||
                                                Number(quantity) < 1 ||
                                                isNaN(Number(quantity))
                                            ) {
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
                                        onClick={() => setQuantity((prev) => Number(prev) + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-2">
                            <Button
                                className="w-full bg-black text-white hover:bg-gray-800 cursor-pointer py-6 text-md font-semibold"
                                onClick={() => stockItemMutation.mutate()}
                                disabled={isUpdatingStock}
                            >
                                {isUpdatingStock ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : null}
                                {isUpdatingStock ? "Updating..." : "Confirm Update"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
