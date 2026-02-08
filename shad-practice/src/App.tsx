import { useEffect, useState } from "react";
import axios from "axios";
import { type Student } from "@/types";
import { StudentForm } from "./components/StudentForm";
import { Toaster } from "@/components/ui/sonner";
import { SideBar } from "./components/sidebar";
import { NavBar } from "./components/navbar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { HomePage } from "./components/main-dashboard/homepage";
import { Layout } from "./layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { InventoryPage } from "./components/manage-inventory/inventoryPage";
import { QuickMode } from "./components/main-dashboard/quickmode";
import EachTable from "./components/manage-inventory/each-table";
import NotificationPage from "./components/notifications/notification-page";
import ReportsPage from "./components/manage-reports/reports-page";
import AuditLogsPage from "./components/audit-logs/audits-page";
import ProfilePage from "./components/profile/profile-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/inventory",
        element: <InventoryPage />
      },
      {
        path: "/quickmode",
        element: <QuickMode />
      },
      {
        path: "/eachtable",
        element: <EachTable />
      },
      {
        path: "/notifications",
        element: <NotificationPage />
      },
      {
        path: "/reports",
        element: <ReportsPage />
      },
      {
        path: "/audit-logs",
        element: <AuditLogsPage />
      },
      {
        path: "/profile",
        element: <ProfilePage />
      }
    ]
  }
]);

function App({children} : {children: React.ReactNode}){
  const [students, setStudents] = useState<Student[]>([]);

  /*
  const fetchStudents = async () => {

      try{
        const response = await axios.get("/api/students");
        console.log("Data from Server:", response.data);
        setStudents(response.data);
      } catch (error){
        console.error("Error fetching data: ", error);
      }

  };
  
  useEffect(() => {
    fetchStudents();
  }, []);
  */

  try {
    return (
    <RouterProvider router={router} />
    
    
    /*
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Student Management</h1>
      <StudentForm onSuccess={fetchStudents} />

      

      <div className="mt-5 space-y-2">
        {students.map((student) => (
        <div key={student._id} className="p-4 border rounded shadow">
          <h2 className="font-bold">{student.name}</h2>
          <p className="text-gray-500">{student.course}</p>
        </div>
        ))}
      </div>
      <Toaster richColors theme="system" />
    </div>
    */
  )
  } catch (error) {
    console.log("There is an error");
  }
  
}

export default App;