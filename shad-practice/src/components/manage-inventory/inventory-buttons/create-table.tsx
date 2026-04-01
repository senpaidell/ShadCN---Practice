import { useState, useEffect } from "react";
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
import { Settings2, CircleCheck } from "lucide-react";
import { Form } from "@/components/ui/form";

const tableOptions = [
  { id: 1, name: "Name", type: "string" },
  { id: 6, name: "Category", type: "string" }, // Added
  { id: 2, name: "Volume", type: "number" },
  { id: 3, name: "Current Stock", type: "number" },
  { id: 4, name: "Par Level", type: "number" },
  { id: 5, name: "Expiration", type: "date" },
]

interface CreateTableProps {
  onSave: (data: any) => Promise<boolean>;
}

interface Attribute {
  name: string;
  dataType: string;
}

export function CreateTable({ onSave }: CreateTableProps) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState(true);

  const form = useForm({
    defaultValues: {
      tableName: "",
      attributes: [] as Attribute[],
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        tableName: "",
        attributes: [],
      });
      setChoice(true);
    }
  }, [open, form]);

  const onSubmit = async (data: any) => {
    const success = await onSave(data);
    console.log("FRONTEND SENDING THIS DATA:", data);

    if (success) {
      setOpen(false);
    }
  };

  const currentSelected = form.watch("attributes");
  const isAllSelected = currentSelected.length === tableOptions.length && tableOptions.length > 0;

  const handleSelectAll = () => {
    if (isAllSelected) {
      form.setValue("attributes", [], { shouldValidate: true });
    } else {
      const allAttributes = tableOptions.map(item => ({
        name: item.name,
        dataType: item.type
      }));
      form.setValue("attributes", allAttributes, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">Create Table</Button>
      </DialogTrigger>

      <DialogContent>
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
              <Input {...form.register("tableName")} placeholder="Enter Table Name" className="" />
            </div>


            {choice ? (
              <div className="flex flex-row justify-center gap-x-4 h-78 w-full">
                <div
                  onClick={handleSelectAll}
                  className={`w-1/2 cursor-pointer transition duration-200 ease-in-out flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border p-4 text-center ${isAllSelected
                    ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white border-black border"
                    : "bg-neutral-300 border-black border hover:brightness-125"
                    }`}
                >
                  <div><CircleCheck size={32} className="" /></div>
                  <div>All in One!</div>
                  <div className="text-xs">All attributes are already provided</div>
                </div>

                <div
                  onClick={() => setChoice(false)}
                  className="w-1/2 cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border border-black p-4 text-center bg-neutral-300"
                >
                  <div><Settings2 size={32} /></div>
                  <div>Custom</div>
                  <div className="text-xs">Choose what you want to see in the table</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full h-auto sm:h-78">

                <div className="w-full sm:w-2/3 flex flex-col gap-y-2 border border-black rounded-[0.625rem] p-4 bg-neutral-200 overflow-y-auto max-h-[300px] sm:max-h-full">
                  {tableOptions.map((item, index) => {
                    const isSelected = currentSelected.some(attr => attr.name === item.name);

                    return (
                      <div
                        key={item.id}
                        className={`cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-black rounded-[0.625rem] p-4 items-center shrink-0 ${isSelected ? "bg-linear-to-t from-sky-500 to-indigo-500 text-white" : "bg-neutral-400"
                          }`}
                        onClick={() => {
                          const current = form.getValues("attributes");
                          if (!isSelected) {
                            form.setValue("attributes", [...current, { name: item.name, dataType: item.type }], { shouldValidate: true });
                          } else {
                            form.setValue("attributes", current.filter(attr => attr.name !== item.name), { shouldValidate: true });
                          }
                        }}
                      >
                        <span className={`text-sm ${isSelected ? "text-white" : "text-black"}`}>
                          {index + 1}.
                        </span>
                        <span>{item.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full sm:w-1/3 flex flex-col gap-y-2 justify-center items-center rounded-[0.625rem] border border-black p-4 text-center bg-neutral-300">
                  <div><Settings2 size={32} /></div>
                  <div>Custom</div>
                  <div className="text-xs">Choose what you want to see in the table</div>
                </div>

              </div>
            )}

            <DialogFooter className="flex sm:justify-between w-full mt-4">
              {!choice && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto cursor-pointer"
                  onClick={() => setChoice(true)}
                >
                  Go Back
                </Button>
              )}

              <div className="flex gap-2 ml-auto">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">Save changes</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}