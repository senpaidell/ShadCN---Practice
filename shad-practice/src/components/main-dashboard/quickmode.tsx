import { Button } from "../ui/button"
import AddIcon from '@mui/icons-material/Add';
import { PieChartComponent } from "../charts/piechart";
import { ToolTipCosh } from "../charts/tooltipchart";
import { Link } from "react-router-dom";
import { Image } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";



const items = [
    {
        id: 1,
        name: "Vince"
    },
]

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

export function QuickMode() {
    const [pageTitle, setPageTitle] = useState("Mode"); 

    return (
        <>
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-4">
                <div className="text-3xl font-bold">
                    Quick Stock {pageTitle}
                </div>
                
                <div className="flex flex-row items-center">
                        <h5 className="text-neutral-400">Click the item you made today for automatic deduction</h5>
                        <Button variant="outline" className="ml-auto cursor-pointer" onClick={() => console.log("Button Pressed")}><Link to="/">Go Back to Home</Link></Button>
                </div>

                <div className="flex w-full">
                    <Tabs defaultValue="Stock Out" className="sm:ml-auto sm:w-96 w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="Stock In" onClick={() => setPageTitle("In")}>
                                Stock In
                            </TabsTrigger>
                            <TabsTrigger value="Stock Out" onClick={() => setPageTitle("Out")}>
                                Stock Out
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="h-[64vh]">
                    <div className="grid grid-cols-3 xl:grid-cols-6 h-full justify-between gap-2">    
                        {itemsOptions.map((item) => (
                            <button onClick={() => console.log("Item Clicked " + item.name + " " + item.id)} className="flex flex-col hover:brightness-125 cursor-pointer w-fill h-fill border-1 flex justify-center items-center border-white/10 rounded-[0.625rem] bg-neutral-900">
                                <div>{item.icon}</div>
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