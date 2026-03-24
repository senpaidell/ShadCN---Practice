import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

// Mock data to demonstrate pagination
const DATA = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  numbers: `0${i + 1}`,
  description: `You have a new update regarding task #${i + 1}.`,
}));

function NotificationHeader() {
  return <CardTitle className="text-2xl font-bold">Notifications</CardTitle>;
}

function NotificationCard({ numbers, description }: any) {
  return (
    <div className="cursor-pointer flex items-center p-4 mb-2 border border-white/10 rounded-[0.625rem] bg-neutral-900 hover:brightness-125 transition duration-200 ease-in-out">
      <span className="flex items-center justify-center w-10 h-10 mr-4 font-mono text-sm font-bold text-white bg-blue-700 rounded-full">
        {numbers}
      </span>
      <span className="text-sm text-white">{description}</span>
    </div>
  );
}

export default function Notification() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Logic to calculate which items to show
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = DATA.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(DATA.length / itemsPerPage);
  const [tableItems, setTableItems] = useState<any[] | null>(null);
  const { id } = useParams();


  useEffect(() => {
    const token = localStorage.getItem("token")
    const fetchTableItems = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error("Failed to fetch items")

        const data = await res.json();
        setTableItems(data);
        console.log("This is homepage data", data)
      } catch (error) {
        console.error("Error loading items on dashboard", error)
      }
    }
    if (id) {
      fetchTableItems()
    }
  }, [id])

  return (
    <>
      <div className="w-full">
        <CardHeader>
          <NotificationHeader />
        </CardHeader>



        <CardContent className="pt-6 min-w-[100px]">
          <div className="min-h-full">
            {currentItems.map((props) => (
              <NotificationCard
                key={props.id}
                numbers={props.numbers}
                description={props.description}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Back
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </div>
    </>
  );
}
