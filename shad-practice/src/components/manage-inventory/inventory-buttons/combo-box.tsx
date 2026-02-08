import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
const frameworks = [
  "Flour",
  "Baking Soda",
  "Eggs",
  "Fat",
  "Sugar",
  "Flavoring",
  "Chocolate"
] as const
export function ComboboxBasic() {
    const [selectedValue, setSelectedValue] = useState("");

  return (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Select an item category" value={selectedValue} />
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
  )
}
