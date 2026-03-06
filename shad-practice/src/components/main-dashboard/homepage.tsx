import { Button } from "../ui/button"
import AddIcon from '@mui/icons-material/Add';
import { PieChartComponent } from "../charts/piechart";
import { ToolTipCosh } from "../charts/tooltipchart";
import { Link, useNavigate } from "react-router-dom";
import { QuickMode } from "./quickmode";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import AddTile from "./buttons/add-tile";



let inStock = 4;
let maxStock =8;

const percentageCalc = (num1 :number, num2: number) => {
    let a = num1 / num2
    return Math.round(a * 100);
}

interface InventoryTable{
    _id: String,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url:string
}

export function HomePage() {
    const [tables, setTables] = useState<InventoryTable[]>([]);
    const [tableData, setTableData] = useState<any>(null);
    const [tableItems, setTableItems] = useState<any[] | null>(null);
    const [tileItems, setTileItems] = useState<any[] | null>(null);
    const [users, setUsers] = useState<any>(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const hours = new Date().getHours();


    
    const tilesRemaining = tileItems?.map((item) => ({
        id: item._id,
        name: item.itemId?.name,
        percentage: Math.round((item.itemId.inStock / (item.itemId.inStock + item.itemId.newStock)) * 100),
        table: item.tableId?.name
    }))

    console.log("Tiles Remaining", tilesRemaining)
    console.log("Users Table", users)

    if (id) {
        console.log("id is working", id)
    }
    //Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch("http://localhost:5000/api/users/getusers", {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) {
                    throw new Error("Failed to Fetch Users Table")
                }
                const data = await res.json();
                setUsers(data);
                console.log("Here are the users data", data)
            } catch (error) {
                console.error("Error loading Users table", error)
            }
        }
        fetchUsers()
    },[])

    //Fetch Tables
    useEffect(() => {
        const fetchTables = async () => {
            const token = localStorage.getItem("token")
            console.log("Homepage FetchTables")
            try {
                const res = await fetch("http://localhost:5000/api/tables", {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) {
                    throw new Error("Failed to fetch");
                }

                const data = await res.json()
                console.log(data)
                setTables(data)

                if (!id && data.length > 0) {
                    console.log("No id found, redirecting to the first table");
                    navigate(`/dashboard/${data[0]._id}`)
                }
            } catch (error) {
                console.error("Error loading tables on Homepage", error)
            }
        }
        fetchTables()
        console.log("fetch tables is working")
    }, [id, navigate])

    //Fetch Table Details
    useEffect(() => {
        const token = localStorage.getItem("token")
        const fetchTableDetails = async () => {
            const res = await fetch(`http://localhost:5000/api/tables/${id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            console.log(data)
            setTableData(data)
        }

        if (id) {
            fetchTableDetails()
            console.log("fetchTableDetails ID", id)
        } else {
            console.log("fetchTableDeailts id is still not working")
        }
    }, [id])

    useEffect(() => {
        if (tableItems !== null) {
            console.log(tableItems)
        } else {
            console.log("still broken")
        }
    }, [tableItems])

    //Fetch Items Inside Tables
    useEffect(() => {
        const token = localStorage.getItem("token")
        const fetchTableItems = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/items/${id}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) throw new Error("Failed to fetch items")
                
                const data = await res.json();
                setTableItems(data);
                console.log("This is homepage data",data)
            } catch (error) {
                console.error("Error loading items on dashboard", error)
            }
        }
        if (id) {
            fetchTableItems()
        }
    }, [id])

    
    // useEffect(() => {
    //     const fetchTileItems = async () => {
    //         try {
    //             const res = await fetch("http://localhost:5000/api/tileItems");
    //             const data = await res.json();
    //             setTileItems(data);
    //             data.map((item: any) => {
    //                 const { itemId } = item
    //                 const { values } = itemId
    //                 console.log("Fetch tile items values", values)
    //             })
    //         } catch (error) {
    //             console.error("Failed to get Tile Items", error)
    //         }
    //     }
    //     fetchTileItems()
    // }, [])

    //Fetch Tile Items Saved in the DB
    const fetchTileItems = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5000/api/tileItems", {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setTileItems(data);
        } catch (error) {
            console.error("Failed to get Tile Items", error)
        }
    }

    useEffect(() => {
        fetchTileItems()
    }, [])
    
    return (
        <>
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-4">
                <div>
                    <div className="text-3xl font-bold">
                        {hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening"}, {users ? `${users.firstName}` : "User"}!
                    </div>
                </div>
                
                <div className="flex flex-row items-center">
                        <h5 className="text-neutral-400">Remaining Items Left</h5>
                        <Button className="ml-auto cursor-pointer"><Link to="/quickmode">Quick Mode</Link></Button>
                </div>

                <div className="itemsRemaining">

                    
                    
                    <div className="boxes grid xl:flex xl:flex-row sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-4 items-center justify-center">
                        {tilesRemaining?.map((items) => (
                            <div key={items.id} className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out relative border-white/10 border-1 h-64 w-full rounded-[0.625rem] ${items.percentage >= 50 ? "bg-linear-to-t from-sky-500 to-indigo-500" : "bg-linear-65 from-purple-500 to-pink-500"}`}>
                                <span className="p-4 absolute top-0 left-0 text-sm font-semibold text-neutral-200"><span className="text-neutral-400">Table: </span>{items.table}</span>
                                <span className={`p-4 absolute bottom-0 left-0 ${items.name?.length > 8 ? 'text-sm' : 'text-xl'} font-bold text-neutral-200`}>{items.name}</span>
                                <span className="p-4 absolute bottom-8 left-0 text-5xl font-bold text-neutral-200">{items.percentage}%</span>
                                <span className={`p-4 absolute bottom-0 right-0 text-3xl font-bold text-neutral-200`}>{items.percentage >= 50 ? "👍" : "🛑"}</span>
                            </div>
                        ))}    
                        {/* <div className="hover:brightness-125 transition duration-200 ease-in-out relative flex flex-col justify-center items-center border-white/10 border-1 h-64 w-full rounded-[0.625rem] bg-neutral-900 cursor-pointer">
                            <AddIcon sx={{ fontSize: 64,}} color="primary" />
                            <h5 className="text-neutral-50 text-center">Add more <br/> item reminder</h5>
                        </div> */}
                        <AddTile onSaveSuccess={fetchTileItems} />
                    </div>
                </div>

                <div className="charts lg:flex gap-x-4 h-fit lg:flex-row grid sm:grid-cols-1 gap-y-4">
                    <div className="chart1 h-full w-full overflow-y-hidden"><PieChartComponent /></div>
                    <div className="chart2 h-full w-full overflow-y-hidden"><ToolTipCosh /></div>
                </div>
            </div>
        </>
    )
}