import type { SchemaResponse, TableMeta, RowRecord } from '../../../types/schema'
import { getTableMeta } from '../../../utils/schema'
import { columnLabel } from './columnLabels'
import { formatCell } from './rowKey'

export type LinkOrigin = {
  tableName: string
  tableLabel: string
  rowKey: string
  row: RowRecord
  column: string
  columnLabel: string
}

export function buildOriginFromTable(
  tableMeta: TableMeta,
  row: RowRecord,
  rowKey: string,
  column: string,
): LinkOrigin {
  return {
    tableName: tableMeta.name,
    tableLabel: tableMeta.label,
    rowKey,
    row,
    column,
    columnLabel: columnLabel(column),
  }
}

export function formatRowSummary(
  schema: SchemaResponse,
  tableName: string,
  row: RowRecord,
): string {
  const meta = getTableMeta(schema, tableName)
  if (!meta) return 'Запись'
  const parts = meta.primary_key.map((key) => {
    const col = meta.columns.find((c) => c.name === key)
    return formatCell(key, row[key], col?.type)
  })
  if (parts.length === 1) {
    return `${meta.label} №${parts[0]}`
  }
  return `${meta.label} (${parts.join(' · ')})`
}

export function formatOriginLine(
  schema: SchemaResponse,
  origin: LinkOrigin,
): string {
  return `Из ${formatRowSummary(schema, origin.tableName, origin.row)} · ${origin.columnLabel}`
}
