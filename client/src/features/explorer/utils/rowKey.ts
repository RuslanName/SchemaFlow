import type { RowRecord, SchemaResponse, TableMeta } from '../../../types/schema'
import { getTableMeta } from '../../../utils/schema'
import { formatCellDisplay } from './formatDisplay'

export function rowKey(
  schema: SchemaResponse | null | undefined,
  table: string,
  row: RowRecord,
): string {
  const meta = getTableMeta(schema, table)
  if (!meta) return `${table}:?`
  const parts = meta.primary_key.map((col) => String(row[col] ?? ''))
  return `${table}:${parts.join('|')}`
}

export function rowPkMap(
  meta: TableMeta | undefined,
  row: RowRecord,
): Record<string, string> {
  if (!meta) return {}
  const out: Record<string, string> = {}
  for (const key of meta.primary_key) {
    out[key] = String(row[key] ?? '')
  }
  return out
}

export function rowHandleId(
  schema: SchemaResponse | null | undefined,
  table: string,
  row: RowRecord,
): string {
  return `row-${rowKey(schema, table, row)}-anchor`
}

export function rowMatchesPk(
  meta: TableMeta | undefined,
  row: RowRecord,
  pk: Record<string, string>,
): boolean {
  if (!meta) return false
  return meta.primary_key.every((col) => String(row[col]) === pk[col])
}

export function formatCell(
  column: string,
  value: unknown,
  columnType?: string,
): string {
  return formatCellDisplay(column, value, columnType)
}
