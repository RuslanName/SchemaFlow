import { exploreApi } from './explore'
import { getTableMeta } from '../utils/schema'
import type { RowRecord, SchemaResponse } from '../types/schema'

export async function resolveFkRow(
  schema: SchemaResponse,
  targetTable: string,
  refColumn: string,
  fkValue: unknown,
): Promise<RowRecord | null> {
  const meta = getTableMeta(schema, targetTable)
  if (!meta) return null

  const needle = String(fkValue)

  if (
    meta.primary_key.length === 1 &&
    meta.primary_key[0] === refColumn
  ) {
    try {
      return await exploreApi.getRow(targetTable, { [refColumn]: needle })
    } catch {
      return null
    }
  }

  const page = await exploreApi.listRows(targetTable, { limit: 500, offset: 0 })
  return (
    page.rows.find((row) => String(row[refColumn]) === needle) ?? null
  )
}
