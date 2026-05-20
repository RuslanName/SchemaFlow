export type ForeignKey = {
  table: string
  column: string
}

export type ColumnMeta = {
  name: string
  type: string
  is_primary: boolean
  foreign_key?: ForeignKey
}

export type TableMeta = {
  name: string
  label: string
  columns: ColumnMeta[]
  primary_key: string[]
}

export type SchemaResponse = {
  tables: TableMeta[]
}

export type RowsPage = {
  rows: Record<string, unknown>[]
  total: number
  limit: number
  offset: number
}

export type RowRecord = Record<string, unknown>
