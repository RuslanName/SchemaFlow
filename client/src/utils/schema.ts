import type { SchemaResponse, TableMeta } from '../types/schema'

export function getTableMeta(
  schema: SchemaResponse | null | undefined,
  name: string,
): TableMeta | undefined {
  return schema?.tables.find((t) => t.name === name)
}
