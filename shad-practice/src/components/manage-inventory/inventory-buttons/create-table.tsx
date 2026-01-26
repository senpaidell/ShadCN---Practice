import { Button } from "../../ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Checkbox } from "../../ui/checkbox";
import { Settings2 } from "lucide-react";

const tableOptions = [
  {
    id: 1,
    name: "Name"
  },
  {
    id: 2,
    name: "Volume"
  },
  {
    id: 3,
    name: "Unit"
  },
  {
    id: 4,
    name: "In Stock"
  },
  {
    id: 5,
    name: "New Stock"
  },
  {
    id: 6,
    name: "Balance"
  },
  {
    id: 7,
    name: "Expiration"
  },
]

export function CreateTable() {
    return (
        <>
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">Create Table</Button>
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader>
                  <DialogTitle>Generate Table</DialogTitle>
                  <DialogDescription>
                    Select the attributes you want to include.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-row gap-x-4">
                  
                  <div className="w-full flex flex-col gap-y-4 border-1 border-white/10 rounded-[0.625rem] p-4 bg-neutral-900">
                    {tableOptions.map((item) => (
                      <div className="flex flex-row gap-x-4">
                        <Checkbox className="cursor-pointer" id="Name" onClick={() => {console.log(item.id)}} />
                        <Label htmlFor="Name">{item.name}</Label>
                    </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border-1 border-white/10 p-4 text-center bg-neutral-900">
                        <div><Settings2 size={32} /></div>
                    <div>Custom</div>
                    <div className="text-neutral-400 text-xs">Choose what you want to see in the table</div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="cursor-pointer">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="cursor-pointer">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </>
    )
}