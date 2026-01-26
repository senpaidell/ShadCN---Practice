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



export function AddItem() {
    return (
        <>
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">+ Add Item</Button>
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader>
                  <DialogTitle>Add Item</DialogTitle>
                  <DialogDescription>
                    Add an ingrendient or an item.
                  </DialogDescription>
                </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Item Name</Label>
                            <Input id="name-1" name="name" defaultValue="E.g. Mr. Flour" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="category">Category Type</Label>
                            <Input id="category-1" name="category" defaultValue="E.g. Flour" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="price-1">Price</Label>
                            <Input id="price-1" name="price" defaultValue="E.g P500" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="price-1">Price</Label>
                            <Input id="price-1" name="price" defaultValue="E.g P500" />
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