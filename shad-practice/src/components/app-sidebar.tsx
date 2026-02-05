import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Home, Inbox, Settings, List, Newspaper } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";

const items = [
    {
        title: "Main Dashboard",
        url: "/",
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
         
    
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>COSH</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
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
        </Sidebar>
    )
}