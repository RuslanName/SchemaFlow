import type { ColumnFilter } from '../../../store/explorerStore'
import type { RowRecord, TableMeta } from '../../../types/schema'

export function matchesFilters(
  meta: TableMeta,
  row: RowRecord,
  filters: Record<string, ColumnFilter>,
): boolean {
  for (const col of meta.columns) {
    const f = filters[col.name]
    if (!f) continue
    const raw = row[col.name]
    const type = col.type.toLowerCase()
    if (type.includes('date') || type.includes('timestamp')) {
      if (raw === null || raw === undefined || raw === '') return false
      const rawDate = new Date(String(raw))
      if (Number.isNaN(rawDate.getTime())) return false
      if (f.from) {
        const from = new Date(f.from)
        if (!Number.isNaN(from.getTime()) && rawDate < from) return false
      }
      if (f.to) {
        const to = new Date(f.to)
        if (!Number.isNaN(to.getTime()) && rawDate > to) return false
      }
      continue
    }
    if (type.includes('int') || type.includes('numeric') || type.includes('decimal')) {
      if (raw === null || raw === undefined || raw === '') return false
      const n = Number(raw)
      if (Number.isNaN(n)) return false
      if (f.min !== undefined && f.min !== '' && n < Number(f.min)) return false
      if (f.max !== undefined && f.max !== '' && n > Number(f.max)) return false
    }
  }
  return true
}
