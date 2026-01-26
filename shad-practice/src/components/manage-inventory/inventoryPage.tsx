import { Button } from "../ui/button"
import { Sheet } from "lucide-react"
import { CreateTable } from "./inventory-buttons/create-table"
import EachTable from "./each-table"
import { Link } from "react-router-dom"

const now:Date = new Date()

const tables = [
    {
        id: 1,
        name: "Cookie Recipe",
        icon: Sheet,
        createdDate: now.toLocaleDateString(),
        url: "/EachTable"
    },
    {
        id: 2,
        name: "Coffee Recipe",
        icon: Sheet,
        createdDate: now.toLocaleDateString(),
        url: "/EachTable"
    },
    {
        id: 3,
        name: "Pastry Recipe",
        icon: Sheet,
        createdDate: now.toLocaleDateString(),
        url: "/EachTable"
    },
]

export function InventoryPage() {
    return (
        <>
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-8 border-2 border-red-600">
                <div className="manageTitle item-center">

                    <div className="flex flex-col gap-y-2">
                        <span className="text-3xl font-bold">Manage Inventory</span>
                    </div>

                    <h5 className="flex items-center description text-neutral-400">Create a table first to manage your inventory.

                        <span className="ml-auto"><CreateTable /></span>
                    </h5>
                </div>
                
                <div className="tableLoc flex flex-col gap-y-4">
                    {tables.map((item) => (
                        <Link to={item.url} onClick={() => console.log(item.id, item.name)}>
                            <div className="cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border-1 border-white/10 rounded-[0.625rem] bg-neutral-900 p-10">
                                <item.icon />
                                <span>{item.name}</span>
                                <span className="ml-auto text-neutral-400">Date Modified: {item.createdDate}</span>
                        </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}