import { api } from './client'
import type { RowRecord, RowsPage, SchemaResponse } from '../types/schema'

export type SortDir = 'asc' | 'desc'

type ListRowsParams = {
  limit?: number
  offset?: number
  sortBy?: string
  sortDir?: SortDir
}

export const exploreApi = {
  getSchema: () => api.get<SchemaResponse>('/api/schema/tables'),
  listRows: (table: string, params: ListRowsParams = {}) => {
    const {
      limit = 50,
      offset = 0,
      sortBy,
      sortDir = 'asc',
    } = params
    const qs = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    })
    if (sortBy) {
      qs.set('sort_by', sortBy)
      qs.set('sort_dir', sortDir)
    }
    return api.get<RowsPage>(
      `/api/tables/${encodeURIComponent(table)}/rows?${qs.toString()}`,
    )
  },
  getRow: (table: string, pk: Record<string, string>) => {
    const params = new URLSearchParams(pk)
    return api.get<RowRecord>(
      `/api/tables/${encodeURIComponent(table)}/row?${params}`,
    )
  },
  createRow: (table: string, payload: RowRecord) =>
    api.post<RowRecord>(`/api/tables/${encodeURIComponent(table)}/rows`, payload),
  updateRow: (table: string, pk: Record<string, string>, payload: RowRecord) => {
    const params = new URLSearchParams(pk)
    return api.patch<RowRecord>(
      `/api/tables/${encodeURIComponent(table)}/row?${params}`,
      payload,
    )
  },
  deleteRow: (table: string, pk: Record<string, string>) => {
    const params = new URLSearchParams(pk)
    return api.delete<{ ok: boolean }>(
      `/api/tables/${encodeURIComponent(table)}/row?${params}`,
    )
  },
}
