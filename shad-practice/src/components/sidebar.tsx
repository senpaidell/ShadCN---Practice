import { useState } from "react";

const sidebarItem = [
    {
        id: 1,
        name: "Main Dashboard"
        //image: "/"
        //link: "/"
    },
    {
        id: 2,
        name: "Manage Inventory"
    },
    {
        id: 3,
        name: "Manage Report"
    },
    {
        id: 4,
        name: "Audit Logs"
    }
];

export function SideBar() {
    return (
        <>
            <div className="p-4 border-2 border-black w-[15vw] h-screen">
                <div className="text-center p-10">COSH</div>
                <div>
                    {sidebarItem.map((item) => (
                        <div key={item.id} className="p-2">
                            <a>{item.name}</a>
                       </div> 
                    ))}
                </div>
            </div>
        </>
    )
}