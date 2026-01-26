import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { NavBar } from "./components/navbar";
import { Toaster } from "./components/ui/sonner";

export function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="overflow-x-hidden w-full">
                <header className="flex h-16 items-center border-b px-4 bg-background">
                    <SidebarTrigger />
                    <NavBar />
                </header>

                <main className="flex-1 p-6">
                    <div className="flex justify-center items-center w-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}