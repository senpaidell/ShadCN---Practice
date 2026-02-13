import { useState } from "react";
import { Button } from "../../ui/button"
import { useForm } from "react-hook-form"
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
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useEffect } from "react";

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

interface CreateTableProps {
  onSave: (data: any) => Promise<boolean>;
}

export function CreateTable({onSave}: CreateTableProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      tableName: "", 
      attributes: [] as string [],
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        tableName: "",
        attributes: [],
      });
    }
  }, [open, form]);

  const onSubmit = async (data: any) => {
    const success = await onSave(data);

    if (success) {
        setOpen(false);
    }
};

    return (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">Create Table</Button>
            </DialogTrigger>
            
          <DialogContent className="">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <DialogHeader>
                  <DialogTitle>Generate Table</DialogTitle>
                  <DialogDescription>
                    Select the attributes you want to include.
                  </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                <Label>Table Name</Label>
                  <Input {...form.register("tableName")} placeholder="Enter Table Name"/>
              </div>
                
              <div className="flex flex-row gap-x-4">
                  <div className="w-full flex flex-col gap-y-4 border-1 border-white/10 rounded-[0.625rem] p-4 bg-neutral-900">
                    {tableOptions.map((item) => (
                      <div className="flex flex-row gap-x-4 hover:bg-neutral-800 transition duration-200 ease-in-out rounded-[0.625rem] p-2">
                        <Checkbox className="cursor-pointer" id={`check-${item.id}`} onClick={() => { console.log(item.id) }}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("attributes");
                            if (checked) {
                              if (!current.includes(item.name)) {
                                form.setValue("attributes", [...current, item.name])
                              }
                            } else {
                              form.setValue("attributes", current.filter(name => name !== item.name))
                            }
                        }}/>
                        <Label className="cursor-pointer" htmlFor={`check-${item.id}`}>{item.name}</Label>
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
                    <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>Cancel</Button>
                  </DialogClose>
                  
                  <Button type="submit" className="cursor-pointer">Save changes</Button>
                </DialogFooter>
              </form>
            </Form>
                
              </DialogContent>
          </Dialog>
        </>
    )
}