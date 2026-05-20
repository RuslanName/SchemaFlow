import type { SortDir } from '../../../api/explore'
import type { ColumnFilter } from '../../../store/explorerStore'
import type { TableMeta, RowRecord } from '../../../types/schema'

export type TableNodeData = {
  meta: TableMeta
  rows: RowRecord[]
  sortBy?: string
  sortDir: SortDir
  onSort: (column: string) => void
  onCreateRow: (payload: RowRecord) => Promise<void>
  onUpdateRow: (pk: Record<string, string>, payload: RowRecord) => Promise<void>
  onDeleteRow: (pk: Record<string, string>, rootRowKey: string) => Promise<void>
  deletingOriginRowKeys: string[]
  onEnterEditMode: () => void
  filters: Record<string, ColumnFilter>
  onSetFilter: (column: string, filter?: ColumnFilter) => void
}
