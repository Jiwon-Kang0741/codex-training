export interface CsvEntry {
  name: string
  email: string
  notes: string
  tags?: string
  next_steps?: string
}

export function entriesToCSV(entries: CsvEntry[]): string {
  const headers = ["name", "email", "notes", "tags", "next_steps"]
  const rows = entries.map((e) =>
    headers
      .map((h) => {
        const value = (e as Record<string, unknown>)[h] ?? ""
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(",")
  )
  return [headers.join(","), ...rows].join("\n")
}

export function downloadCSV(entries: CsvEntry[], filename = "customers.csv") {
  const csv = entriesToCSV(entries)
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
