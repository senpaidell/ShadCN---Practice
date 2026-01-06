import { useEffect, useState } from "react";
import axios from "axios";
import { type Student } from "@/types";
import { StudentForm } from "./components/StudentForm";
import { Toaster } from "@/components/ui/sonner";


function App(){
  const [students, setStudents] = useState<Student[]>([]);

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

  return(
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
  )
}

export default App;