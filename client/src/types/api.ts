export type HealthResponse = {
  status: string
}

export type ApiError = {
  error: string
  details?: Record<string, string>
}

export type { SchemaResponse, RowsPage, TableMeta, RowRecord } from './schema'
