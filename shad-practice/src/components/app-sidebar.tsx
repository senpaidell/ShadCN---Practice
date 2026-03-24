import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Home, Inbox, Settings, List, Newspaper } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarFooter
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";
import logo from "@/assets/cosh-anniv-logo.png";
import { LogOut } from "./login/logout";

const items = [
    {
        title: "Main Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Manage Inventory",
        url: "/inventory",
        icon: List,
    },
    {
        title: "Manage Reports",
        url: "/reports",
        icon: Newspaper,
    },
    {
        title: "Audit Logs",
        url: "/audit-logs",
        icon: Settings,
    },
]
export function AppSidebar() {
    const { isMobile, setOpenMobile } = useSidebar();
    return (

        <div className="dark">
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <div className="flex justify-center">
                            <img src={logo} className="h-36" />
                        </div>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title} className="">
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url} onClick={() => {
                                                if (isMobile) {
                                                    setOpenMobile(false);
                                                }
                                            }}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <LogOut />
                </SidebarFooter>
            </Sidebar>
        </div>

    )
}