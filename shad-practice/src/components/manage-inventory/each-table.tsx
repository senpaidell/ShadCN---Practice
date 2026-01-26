import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { AddItem } from "./inventory-buttons/add-item"
import { FilterItem } from "./inventory-buttons/filter-item"
import { TableSelector } from "./inventory-buttons/table-selector"

export default function EachTable() {
    return (
        
        <>
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-8 border-2 border-purple-600">
                <div className="manageTitle item-center border-2 border-blue-600">
                
                    <div className="flex flex-col gap-y-2 border-2 border-red-600">
                        <span className="text-3xl font-bold">Manage Inventory</span>
                    </div>

                    <div className="flex">
                        <span className="mr-auto">
                            <TableSelector />
                        </span>
                        <span className="ml-auto flex flex-row gap-x-2">
                            <span><FilterItem /></span>
                            <span><AddItem /></span>
                        </span> 
                    </div>
                
                    <h5 className="flex items-center description text-neutral-400">Create a table first to manage your inventory.
                        <div className="flex flex-row ml-auto gap-x-2">
                            <span></span>
                            <span></span>
                        </div>
                    </h5>
                </div>
                <Link to="/inventory">
                    <Button className="cursor-pointer">
                        Go Back
                    </Button>
                </Link>
            </div>
        </>

    )
}