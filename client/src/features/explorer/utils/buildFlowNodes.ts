import type { Node } from '@xyflow/react'
import type { RowRecord, SchemaResponse } from '../../../types/schema'
import type { ColumnFilter, RecordCard } from '../../../store/explorerStore'
import { tableNodeId } from '../../../store/explorerStore'
import { getTableMeta } from '../../../utils/schema'
import type { SortDir } from '../../../api/explore'

export function buildFlowNodesWithSchema(
  schema: SchemaResponse,
  activeTable: string,
  cards: RecordCard[],
  rows: RowRecord[],
  sortBy: string | undefined,
  sortDir: SortDir,
  onSort: (column: string) => void,
  onCreateRow: (payload: RowRecord) => Promise<void>,
  onUpdateRow: (pk: Record<string, string>, payload: RowRecord) => Promise<void>,
  onDeleteRow: (pk: Record<string, string>, rootRowKey: string) => Promise<void>,
  deletingOriginRowKeys: string[],
  onEnterEditMode: () => void,
  filters: Record<string, ColumnFilter>,
  onSetFilter: (column: string, filter?: ColumnFilter) => void,
): Node[] {
  const meta = getTableMeta(schema, activeTable)
  if (!meta) return []

  const nodes: Node[] = [
    {
      id: tableNodeId(activeTable),
      type: 'table',
      position: { x: 0, y: 0 },
      draggable: false,
      selectable: false,
      className: 'react-flow__node-table',
      data: {
        meta,
        rows,
        sortBy,
        sortDir,
        onSort,
        onCreateRow,
        onUpdateRow,
        onDeleteRow,
        deletingOriginRowKeys,
        onEnterEditMode,
        filters,
        onSetFilter,
      },
    },
  ]

  for (const card of cards) {
    const cardMeta = getTableMeta(schema, card.table)
    if (!cardMeta) continue
    nodes.push({
      id: card.key,
      type: 'record',
      position: card.position,
      draggable: true,
      data: {
        meta: cardMeta,
        row: card.row,
        cardKey: card.key,
        origin: card.origin,
        parentCardKey: card.parentCardKey,
      },
    })
  }

  return nodes
}
