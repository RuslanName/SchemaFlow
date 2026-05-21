import type { RowRecord, TableMeta } from '../../../types/schema'

export function matchesIdSearch(meta: TableMeta, row: RowRecord, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  return meta.primary_key.some((col) => String(row[col] ?? '').includes(q))
}
