import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface InventoryTable{
    _id: string,
    name: string,
    attributes: string[],
    icon: any,
    createdAt: string,
    url: string
}

export function TableSelector() {
  const [tables, setTables] = useState<InventoryTable[]>([])
  const navigate = useNavigate()
  
      useEffect(() => {
          console.log("useEffect is running")
          const fetchTables = async () => {
              console.log("I am inside fetchTables")
              try {
                  const res = await fetch('http://localhost:5000/api/tables')
                  if (!res.ok) {
                      throw new Error("Failed to fetch");
                  }
  
                  const data = await res.json();
                  setTables(data);
              } catch (error) {
                  console.error("Error loading tables:", error)
              }
          }
          fetchTables()
      }, [])
  
  return (
    <Select onValueChange={(value) => navigate(`/table/${value}`)}>
      <SelectTrigger className="w-full max-w-48 cursor-pointer">
        <SelectValue placeholder="Select a table" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>

          {tables.map((item) => (
              <SelectItem className="cursor-pointer" key={item._id} value={item._id}>{item.name} Table</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
