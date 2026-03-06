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
import { ComboboxBasic } from "./combo-box";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"


export function AddItem({ tableData, onSave }: { tableData: any, onSave: any }) {
  const attributes = tableData?.attributes || []
  
  const [name, setName] = useState("");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  
  const handleInputChange = (attr: string, value: string) => {
    setDynamicValues((prev) => ({
      ...prev,
      [attr]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    //FOR BACKUP
    // const itemData = {
    //   tableId: tableData._id,
    //   name: name,
    //   values: dynamicValues
    // }

    const itemData = {
      tableId: tableData._id,
      name: name,
      inStock: Number(dynamicValues["In Stock"]) || 0,
      newStock: Number(dynamicValues["New Stock"]) || 0,
      volume: Number(dynamicValues["Volume"]) || 0,
      expiration: dynamicValues["Expiration"] || undefined
    }

    const success = await onSave(itemData);
    if (success) {
      setName("");
      setDynamicValues({})
      setOpen(false);
    }
  }

  function Unit() {
    const units = ["L", "mL"];
    return (
      <div className="max-w-50">
        <Combobox items={units}>
        <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    )

  }

    return (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">+ Add Item</Button>
              </DialogTrigger>
          
          <DialogContent className="">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Item</DialogTitle>
                  <DialogDescription>
                    Add an ingrendient or an item.
                  </DialogDescription>
                </DialogHeader>
                    
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-y-3">
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input id="item-name" className="h-12" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter item name" required />
                    </div>
                  </div>
              
                  <div className="flex flex-col gap-4 my-4 overflow-auto max-h-120">
                    {attributes.map((attr: any) => (
                      <div key={attr.name} className="flex flex-col gap-y-2">
                        <Label htmlFor={attr.name}>{attr.name}</Label>
                        <Input className="h-12" id={attr.name} value={dynamicValues[attr.name] || ""} onChange={(e) => handleInputChange(attr.name, e.target.value)} placeholder={`Enter ${attr.name}`} />
                        {attr.name === "Volume" ? <Unit /> : null}
                      </div>
                    ))}
                  </div>

              

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="cursor-pointer" onClick={()=> setOpen(false)}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="cursor-pointer">Save changes</Button>
                </DialogFooter>
              </form>
              </DialogContent>
          </Dialog>
        </>
    )
}