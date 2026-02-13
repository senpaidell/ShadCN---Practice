import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { AddItem } from "./inventory-buttons/add-item"
import { FilterItem } from "./inventory-buttons/filter-item"
import { TableSelector } from "./inventory-buttons/table-selector"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { DataTable } from "./data-table/data-table"
import { createColumns } from "./data-table/columns"

interface InventoryTable{
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
    const [rows, setRows] = useState([])

    useEffect(() => {
        const fetchTableDetails = async () => {
            const res = await fetch(`http://localhost:5000/api/tables/${id}`)
            const data = await res.json()
            setTableData(data)
        }

        if (id) {
            fetchTableDetails()
        }
    }, [id])

    useEffect(() => {
        console.log("useEffect is running")
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
                console.error("Error loading tables:", error)
            }
        }
        fetchTables()
    }, [])


    if (!tableData) {
        return <div>Loading...</div>
    }

    const columns = createColumns(tableData.attributes);

    
    return (
        
        <>
            <div className="w-screen sm:p-10 p-2">
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

                <div>
                    <h1>{tableData.name}</h1>
                    <DataTable columns={columns} data={rows} />
                </div>
                
            </div>
        </>

    )
}