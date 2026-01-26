import { Button } from "../ui/button"
import AddIcon from '@mui/icons-material/Add';
import { PieChartComponent } from "../charts/piechart";
import { ToolTipCosh } from "../charts/tooltipchart";
import { Link } from "react-router-dom";
import { QuickMode } from "./quickmode";

const items = [
    {
        id: 1,
        name: "Vince"
    },
]

let inStock = 4;
let maxStock =8;


const percentageCalc = (num1 :number, num2: number) => {
    let a = num1 / num2
    return Math.round(a * 100);
}



const itemsRemaining = [
    {
        id: 1,
        name: "Flour",
        percentage: percentageCalc(inStock, maxStock)
    },
    {
        id: 1,
        name: "Butter",
        percentage: 67
    },
    {
        id: 1,
        name: "Sugar",
        percentage: 69
    },
]

export function HomePage() {
    return (
        <>
            <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-4">
                <div>
                    {items.map((item) => (
                        <div key={item.id} className="text-3xl font-bold">
                            Good Morning, {item.name}!
                        </div>
                    ))} 
                </div>
                
                <div className="flex flex-row items-center">
                        <h5 className="text-neutral-400">Remaining Items Left</h5>
                        <Button className="ml-auto cursor-pointer"><Link to="/quickmode">Quick Mode</Link></Button>
                </div>

                <div className="itemsRemaining">

                    
                    
                    <div className="boxes grid xl:flex xl:flex-row sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-4 items-center justify-center">
                        {itemsRemaining.map((items) => (
                            <div key={items.id} className="hover:scale-102 transition duration-200 ease-in-out relative border-white/10 border-1 h-64 w-full rounded-[0.625rem] bg-neutral-900">
                                <span className="p-4 absolute bottom-0 left-0 text-5xl font-bold text-neutral-200">{items.percentage}%</span>
                                <span className="p-4 absolute bottom-0 right-0 text-xl font-bold text-neutral-200">{items.name}</span>
                            </div>
                        ))}    
                        <div className="hover:brightness-125 transition duration-200 ease-in-out relative flex flex-col justify-center items-center border-white/10 border-1 h-64 w-full rounded-[0.625rem] bg-neutral-900 cursor-pointer">
                            <AddIcon sx={{ fontSize: 64,}} color="primary" />
                            <h5 className="text-neutral-50 text-center">Add more <br/> item reminder</h5>
                        </div>
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