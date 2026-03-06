import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const AUDIT_DATA = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "Lorem Ipsum",
  activity: "Deleted Item",
  date: "Wed, Nov. 19, 2025",
  email: "user@gmail.com",
}));

export default function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = AUDIT_DATA.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(AUDIT_DATA.length / itemsPerPage);
  return (

    <div className="flex-1 bg-[#0a0a0a] text-white p-6 md:p-10 font-sans min-h-screen w-full">
      <div className="flex justify-between items-end mb-6 mx-auto max-w-[1100px]">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-white text-black rounded-md px-6 h-8 text-xs font-bold hover:bg-zinc-200">
              Filter
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#0a0a0a] text-white max-w-md rounded-lg p-0 overflow-hidden border border-[#1a1a1a]">
            <div className="p-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-left">Filter</DialogTitle>
                <p className="text-xs text-zinc-400 text-left pt-1">
                  Select the attribute/s you want to filter.
                </p>
              </DialogHeader>

              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-neutral-900 p-4 rounded-[0.625rem] space-y-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="name" className="border-zinc-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                    <label htmlFor="name" className="text-xs font-bold text-white">Name & Email</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="activity" className="border-zinc-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                    <label htmlFor="activity" className="text-xs font-bold text-white">Activity</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="date" className="border-zinc-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                    <label htmlFor="date" className="text-xs font-bold text-white">Date</label>
                  </div>
                </div>

                <div className="w-1/3 flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border border-white/10 p-4 text-center bg-neutral-900">
                  <div><Settings2 size={24} /></div>
                  <div className="text-xs font-bold">Custom</div>
                  <div className="text-neutral-400 text-[9px] leading-tight">Choose what you want to see in the table</div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button className="flex-1 bg-zinc-800 text-white text-xs font-bold border border-zinc-700 h-9">Cancel</Button>
                <Button className="flex-1 bg-white text-black text-xs font-bold h-9">Confirm</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border border-[#1a1a1a] rounded-xl overflow-hidden bg-[#0a0a0a] mx-auto max-w-[1100px] shadow-2xl">
        <Table className="w-full border-collapse">
          <TableHeader className="bg-[#0a0a0a] border-b border-[#1a1a1a]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-16 text-center font-bold text-white">#</TableHead>
              <TableHead className="text-white font-bold text-center ">Name</TableHead>
              <TableHead className="text-white font-bold text-center  ">Activity</TableHead>
              <TableHead className="text-white font-bold text-center ">Date Created</TableHead>
              <TableHead className="text-white font-bold text-center ">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((log) => (
              <TableRow key={log.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#111] h-16 transition-colors">
                <TableCell className="text-center font-bold">{log.id}</TableCell>
                <TableCell className="text-center">
                    <span className="font-bold text-white text-sm">{log.name}</span>
                </TableCell>
                <TableCell className="text-center font-bold ">{log.activity}</TableCell>
                <TableCell className="text-center font-bold ">{log.date}</TableCell>
                <TableCell className="text-center font-bold ">{log.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-2 mt-6 mx-auto max-w-[1100px]">
        <Button 
          variant="outline"
          className="border-[#1a1a1a] text-white bg-transparent text-[10px] px-4 h-8 rounded-md hover:bg-[#111]"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        <div className="bg-[#111] text-white px-4 py-1.5 rounded-md text-[10px] font-bold border border-[#1a1a1a]">
          {currentPage}
        </div>
        <Button 
          variant="outline"
          className="border-[#1a1a1a] text-white bg-transparent text-[10px] px-4 h-8 rounded-md hover:bg-[#111]"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}