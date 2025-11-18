"use client"

import { useState } from "react"

interface ComboboxProps<T> {
  items: T[]
  value: string
  onSelect: (item: T) => void
  itemLabel: (item: T) => string
  placeholder?: string
}

export function Combobox<T>({ items, value, onSelect, itemLabel, placeholder }: ComboboxProps<T>) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filteredItems = query
    ? items.filter((item) =>
        itemLabel(item).toLowerCase().includes(query.toLowerCase())
      )
    : items

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)} // delay to allow click
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border px-2 py-1 rounded"
      />
      {open && filteredItems.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto border bg-background shadow-lg rounded">
          {filteredItems.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(item)
                setQuery("")
              }}
              className="cursor-pointer px-4 py-2 hover:bg-primary/10"
            >
              {itemLabel(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
