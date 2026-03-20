import { Button } from "../ui/button"
import AddIcon from '@mui/icons-material/Add';
import { PieChartComponent } from "../charts/piechart";
import { ToolTipCosh } from "../charts/tooltipchart";
import { Link } from "react-router-dom";
import { Image } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";

const itemsOptions = [
    {
        id: 1,
        name: "Vince",
        icon: <Image size={32} />
    },
    {
        id: 2,
        name: "Randell",
        icon: <Image size={32} />
    },
    {
        id: 3,
        name: "Perez",
        icon: <Image size={32} />
    },
    {
        id: 4,
        name: "Robosa",
        icon: <Image size={32} />
    },
    {
        id: 5,
        name: "Vince",
        icon: <Image size={32} />
    },
    {
        id: 6,
        name: "Randell",
        icon: <Image size={32} />
    },
    {
        id: 7,
        name: "Perez",
        icon: <Image size={32} />
    },
    {
        id: 8,
        name: "Robosa",
        icon: <Image size={32} />
    },
    {
        id: 9,
        name: "Vince",
        icon: <Image size={32} />
    },
    {
        id: 10,
        name: "Randell",
        icon: <Image size={32} />
    },
    {
        id: 11,
        name: "Perez",
        icon: <Image size={32} />
    },
    {
        id: 12,
        name: "Robosa",
        icon: <Image size={32} />
    },
    {
        id: 13,
        name: "Vince",
        icon: <Image size={32} />
    },
    {
        id: 14,
        name: "Randell",
        icon: <Image size={32} />
    },
]

interface InventoryTable {
    _id: string,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url: string
}

export function QuickMode() {
    const [pageTitle, setPageTitle] = useState("Mode");
    const [tables, setTables] = useState<InventoryTable[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const [rows, setRows] = useState<any[]>([])
    const { id } = useParams()
    const [tableID, setTableID] = useState<string | undefined>();
    const [items, setItems] = useState<any[] | null>(null);
    useEffect(() => {
        const fetchTables = async () => {
            const token = localStorage.getItem("token")
            try {
                const res = await fetch("https://coshts-backend.vercel.app/api/tables", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) throw new Error("Failed to fetch Quick Mode")

                const data = await res.json()
                setTables(data)
            } catch (error) {
                console.log("Error loading fetchTables on Add-Tile", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTables();
    }, [id])

    useEffect(() => {
        const fetchTableDetails = async () => {
            const token = localStorage.getItem("token");
            if (!tableID) return;
            try {
                const res = await fetch(`https://coshts-backend.vercel.app/api/tables/${id}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) throw new Error("Error fetching table items");
                const data = await res.json();
                setRows(data)
            } catch (error) {
                console.log("Error fetching table items", error)
            }
        }
        fetchTableDetails()
    }, [id])

    useEffect(() => {
        console.log("Use effect is working?")
        const token = localStorage.getItem("token");
        const fetchTableItems = async () => {
            try {
                const res = await fetch(`https://coshts-backend.vercel.app/api/items/${id}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!res.ok) throw new Error("Error fetching actual items")
                const data = await res.json();
                setItems(data);
                console.log("Here is the data: ")
            } catch (error) {
                console.log(error)
            }
        }
        if (id) {
            fetchTableItems()
        } else {
            console.log("id is not being called")
        }
    }, [id])

    console.log("Quick Mode")
    console.log(items)
    return (
        <>
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-4">
                <div className="text-3xl font-bold">
                    Quick Stock {pageTitle}
                </div>

                <div className="flex flex-row items-center">
                    <h5 className="text-neutral-400">Click the item you made today for automatic deduction</h5>
                    <Link to="/dashboard" className="ml-auto"><Button variant="outline" className="cursor-pointer" onClick={() => console.log("Button Pressed")}>Go Back to Home</Button></Link>
                </div>

                <div className="flex w-full">
                    <Tabs defaultValue="Stock Out" className="sm:ml-auto sm:w-96 w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="Stock In" className="cursor-pointer hover:brightness-125" onClick={() => setPageTitle("In")}>
                                Stock In
                            </TabsTrigger>
                            <TabsTrigger value="Stock Out" className="cursor-pointer hover:brightness-125" onClick={() => setPageTitle("Out")}>
                                Stock Out
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="h-[64vh]">
                    <div className="grid grid-cols-3 xl:grid-cols-6 h-full justify-between gap-2">
                        {items?.map((item) => (
                            <button key={item.id} onClick={() => console.log("Item Clicked " + item.name + " " + item.id)} className="flex flex-col hover:brightness-125 cursor-pointer w-fill h-fill border-1 flex justify-center items-center border-white/10 rounded-[0.625rem] bg-neutral-900">
                                <div><Image size={32} /></div>
                                <div>{item.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex">
                    <Button className="ml-auto cursor-pointer">Remove Tile</Button>
                </div>
            </div>
        </>
    )
}