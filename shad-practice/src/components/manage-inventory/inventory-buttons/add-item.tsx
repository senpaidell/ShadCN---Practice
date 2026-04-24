import { Button } from "../../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useState } from "react";
import { useLogAudit } from "@/hooks/useLogAudit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Flour", "Baking Soda", "Eggs", "Fat", "Sugar", "Flavoring", "Chocolate", "Custom"];
const DEFAULT_UNITS = ["L", "mL", "g", "kg", "oz", "lbs"];

export function AddItem({ tableData, existingItems, onSave }: { tableData: any, existingItems: any[], onSave: any }) {
  const attributes = tableData?.attributes || []
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [volumeUnit, setVolumeUnit] = useState("mL");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const [preventDuplicate, setPreventDuplicate] = useState(true);
  const [nameError, setNameError] = useState("");

  const { mutate: logAudit } = useLogAudit();

  const handleInputChange = (attr: string, value: string) => {
    setDynamicValues((prev) => ({ ...prev, [attr]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    if (preventDuplicate) {
      const isDuplicate = existingItems.some(
        (item: any) => item.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (isDuplicate) {
        setNameError("An item with this name already exists in this table.");
        return;
      }
    }

    const baseCategory = category === "Custom" ? customCategory : category;
    const finalCategory = baseCategory.trim() || "Uncategorized";

    const itemData = {
      tableId: tableData._id,
      name: name.trim(),
      category: finalCategory,
      volumeUnit: volumeUnit,
      currentStock: Number(dynamicValues["Current Stock"]) || 0,
      parLevel: Number(dynamicValues["Par Level"]) || 0,
      volume: Number(dynamicValues["Volume"]) || 0,
      expiration: dynamicValues["Expiration"] || undefined,
      preventDuplicate
    }

    const success = await onSave(itemData);
    if (success) {
      logAudit({ targetName: name, tableName: tableData.name, activity: "New Item" });
      setName(""); setCategory(""); setCustomCategory(""); setDynamicValues({}); setNameError(""); setOpen(false);
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
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                maxLength={30}
                className={`h-12 ${nameError ? "border-red-500" : ""}`}
                value={name}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.length > 30) return;

                  // Allow letters, numbers, spaces, and periods
                  val = val.replace(/[^a-zA-Z0-9\s.]/g, "");

                  setName(val);
                  if (nameError) setNameError("");
                }}
                placeholder="Enter item name"
                required
              />
              <div className="flex justify-between items-start mt-1">
                <p className="text-[11px] text-gray-500">
                  Only letters, numbers, spaces, and periods allowed.
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  {name.length}/30
                </p>
              </div>
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>

            {/* Prevent Duplicate Toggle */}
            <div className="flex items-center space-x-2 py-1 mt-2">
              <input
                type="checkbox"
                id="prevent-duplicate"
                checked={preventDuplicate}
                onChange={(e) => setPreventDuplicate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
              <Label htmlFor="prevent-duplicate" className="text-sm text-gray-600 cursor-pointer">
                Prevent duplicate item names
              </Label>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-y-2 mt-2">
              <Label>Category</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {category === "Custom" && (
                <div className="flex flex-col gap-y-1 mt-1">
                  <Input
                    className="h-12"
                    placeholder="Type custom category..."
                    maxLength={30}
                    value={customCategory}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length > 30) return;
                      val = val.replace(/[^a-zA-Z0-9\s.]/g, "");
                      setCustomCategory(val);
                    }}
                  />
                  <div className="flex justify-between items-start mt-1">
                    <p className="text-[11px] text-gray-500">
                      Only letters, numbers, spaces, and periods allowed.
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {customCategory.length}/30
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Attributes (Filtered) */}
            {attributes.filter((attr: any) => attr.name !== "Name").map((attr: any) => {
              const isDate = attr.name === "Expiration";
              const isNumber = attr.dataType === "number" || attr.name.includes("Stock") || attr.name.includes("Level") || attr.name === "Volume";
              const inputType = isDate ? "date" : (isNumber ? "number" : "text");

              const valStr = String(dynamicValues[attr.name] ?? "");

              return (
                <div key={attr.name} className="flex flex-col gap-y-1 mt-2">
                  <Label htmlFor={attr.name}>{attr.name}</Label>
                  <div className="flex gap-2">
                    <Input
                      className="h-12 flex-1"
                      type={inputType}
                      maxLength={inputType === "text" ? 30 : undefined}
                      id={attr.name}
                      value={valStr}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.length > 30) return;

                        if (inputType === "text") {
                          val = val.replace(/[^a-zA-Z0-9\s.]/g, "");
                        }

                        handleInputChange(attr.name, val);
                      }}
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
                  <div className="flex justify-between items-start mt-1">
                    <p className="text-[11px] text-gray-500">
                      {inputType === "text" && "Only letters, numbers, spaces, and periods allowed."}
                      {inputType === "number" && "Only numbers allowed."}
                      {inputType === "date" && "Please select a valid date."}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {valStr.length}/30
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="secondary" className="bg-gray-200 text-black hover:bg-gray-300 cursor-pointer" onClick={() => setOpen(false)}>Cancel</Button></DialogClose>
            <Button type="submit" disabled={!name.trim()} className="cursor-pointer">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}