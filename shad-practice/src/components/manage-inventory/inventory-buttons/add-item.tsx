import { Button } from "../../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useState } from "react";
import { useLogAudit } from "@/hooks/useLogAudit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Flour", "Baking Soda", "Eggs", "Fat", "Sugar", "Flavoring", "Chocolate", "Custom"];
const DEFAULT_UNITS = ["L", "mL", "g", "kg", "oz", "lbs"];

export function AddItem({ tableData, onSave }: { tableData: any, onSave: any }) {
  const attributes = tableData?.attributes || []
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [volumeUnit, setVolumeUnit] = useState("mL");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const { mutate: logAudit } = useLogAudit();

  const handleInputChange = (attr: string, value: string) => {
    setDynamicValues((prev) => ({ ...prev, [attr]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Custom" ? customCategory : category;

    const itemData = {
      tableId: tableData._id,
      name: name,
      category: finalCategory,
      volumeUnit: volumeUnit,
      currentStock: Number(dynamicValues["Current Stock"]) || 0,
      parLevel: Number(dynamicValues["Par Level"]) || 0,
      volume: Number(dynamicValues["Volume"]) || 0,
      expiration: dynamicValues["Expiration"] || undefined
    }

    const success = await onSave(itemData);
    if (success) {
      logAudit({ targetName: name, tableName: tableData.name, activity: "New Item" });
      setName(""); setCategory(""); setCustomCategory(""); setDynamicValues({}); setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="cursor-pointer">+ Add Item</Button></DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>Add an ingredient or an item.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4 max-h-120 overflow-auto px-1">
            {/* Item Name */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input id="item-name" className="h-12" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter item name" required />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-y-2">
              <Label>Category</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {category === "Custom" && (
                <Input className="h-12 mt-1" placeholder="Type custom category..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
              )}
            </div>

            {/* Dynamic Attributes (Filtered) */}
            {attributes.filter((attr: any) => attr.name !== "Name").map((attr: any) => (
              <div key={attr.name} className="flex flex-col gap-y-2">
                <Label htmlFor={attr.name}>{attr.name}</Label>
                <div className="flex gap-2">
                  <Input
                    className="h-12 flex-1"
                    type={attr.name === "Expiration" ? "date" : (attr.dataType === "number" ? "number" : "text")}
                    id={attr.name}
                    value={dynamicValues[attr.name] || ""}
                    onChange={(e) => handleInputChange(attr.name, e.target.value)}
                    placeholder={`Enter ${attr.name}`}
                  />
                  {attr.name === "Volume" && (
                    <div className="w-24">
                      <Input
                        list="unit-options"
                        className="h-12"
                        value={volumeUnit}
                        onChange={(e) => setVolumeUnit(e.target.value)}
                        placeholder="Unit"
                      />
                      <datalist id="unit-options">
                        {DEFAULT_UNITS.map(u => <option key={u} value={u} />)}
                      </datalist>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <DialogClose asChild><Button variant="secondary" className="bg-gray-200 text-black hover:bg-gray-300" onClick={() => setOpen(false)}>Cancel</Button></DialogClose>
            <Button type="submit" disabled={!name.trim()}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}