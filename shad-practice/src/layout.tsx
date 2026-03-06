import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { NavBar } from "./components/navbar";
import { Toaster } from "./components/ui/sonner";

export function Layout() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <SidebarInset className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <header className="sticky top-0 z-50 shrink-0 flex h-16 items-center border-b px-4 bg-background">
                    <SidebarTrigger className="-ml-1" />
                    <NavBar />
                </header>

                <main className="flex-1 p-6">
                    <div className="flex justify-center items-center w-full">
                        <Outlet />
                        <Toaster position="top-center" richColors closeButton={false} duration={2000}/>
                    </div>
                </main>
            </SidebarInset>
            </div>
            
        </SidebarProvider>
    )
}