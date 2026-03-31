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
import SignUp from "./components/login/signup";
import ProtectedRoute from "./components/login/ProtectedRoute";
import CoshAuth from "./components/login/CoshAuth2";
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.log("Session expired. Logging out...");
        localStorage.removeItem("jwt_token");
        window.location.href = "/login"
      }
    }
  })
});

const router = createBrowserRouter([
  {
    path: "/login",
    element: <CoshAuth />
  },
  {
    path: "/signup",
    element: <SignUp />
  },
  {
    path: "/",
    // element: <Layout />,
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <HomePage />
          },
          {
            path: "/inventory",
            element: <InventoryPage />
          },
          {
            path: "/quickmode/:id?",
            element: <QuickMode />
          },
          {
            path: "/table/:id",
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
          },
          {
            path: "/dashboard/:id?",
            element: <HomePage />
          },
        ]
      }]
  }
]);

function App() {
  try {
    return (

      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )
  } catch (error) {
    console.log("There is an error");
  }

}

export default App;