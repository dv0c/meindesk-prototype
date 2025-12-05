"use client"

import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TableProps {
  headers?: any[] // Changed from string to JSON array
  rows?: any[] // Changed from string to JSON array
  className?: string
}

export default function Table({
  headers = [{ label: "Header 1" }, { label: "Header 2" }, { label: "Header 3" }],
  rows = [
    { cells: [{ value: "Row 1 Col 1" }, { value: "Row 1 Col 2" }, { value: "Row 1 Col 3" }] },
    { cells: [{ value: "Row 2 Col 1" }, { value: "Row 2 Col 2" }, { value: "Row 2 Col 3" }] },
  ],
  className = "",
}: TableProps) {
  const headerList = Array.isArray(headers) ? headers : []
  const rowList = Array.isArray(rows) ? rows : []

  return (
    <ShadcnTable className={className}>
      <TableHeader>
        <TableRow>
          {headerList.map((header, idx) => (
            <TableHead key={idx}>{header.label || `Header ${idx + 1}`}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rowList.map((row, rowIdx) => (
          <TableRow key={rowIdx}>
            {(row.cells || []).map((cell: any, cellIdx: number) => (
              <TableCell key={cellIdx}>{cell.value || ""}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </ShadcnTable>
  )
}
