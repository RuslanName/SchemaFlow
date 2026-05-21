import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateNodeInternals, type NodeProps } from '@xyflow/react'
import clsx from 'clsx'
import { Check, Plus, Search, Table2, X } from 'lucide-react'
import type { RowRecord } from '../../../types/schema'
import { rowKey, rowPkMap } from '../utils/rowKey'
import { useExplorerStore, tableNodeId, type ColumnFilter } from '../../../store/explorerStore'
import { useSchema } from '../../../context/SchemaContext'
import { exploreApi } from '../../../api/explore'
import { buildOriginFromTable } from '../utils/linkOrigin'
import { TableColumnHeader } from './TableColumnHeader'
import { TableEditorCell } from './TableEditorCell'
import { TableDataRow } from './TableDataRow'
import type { TableNodeData } from './tableNodeTypes'
import { stopFlowEvent } from '../utils/stopFlowEvent'
import './nodes.css'

export type { TableNodeData } from './tableNodeTypes'

function TableNodeComponent({ data }: NodeProps) {
  const schema = useSchema()
  const nodeData = data as TableNodeData
  const {
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
    idSearch,
    onIdSearchChange,
  } = nodeData
  const expandFk = useExplorerStore((s) => s.expandFk)
  const requestFitView = useExplorerStore((s) => s.requestFitView)
  const sourceId = tableNodeId(meta.name)
  const rootRef = useRef<HTMLDivElement>(null)
  const updateNodeInternals = useUpdateNodeInternals()
  const [adding, setAdding] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draft, setDraft] = useState<RowRecord>({})
  const [busy, setBusy] = useState(false)
  const [fkOptions, setFkOptions] = useState<Record<string, RowRecord[]>>({})
  const [openedFilterCol, setOpenedFilterCol] = useState<string | null>(null)
  const [filterDraft, setFilterDraft] = useState<ColumnFilter>({})

  const colCount = meta.columns.length
  const densityClass =
    colCount > 10 ? 'table-node--dense' : colCount > 7 ? 'table-node--compact' : ''
  const deletingSet = useMemo(() => new Set(deletingOriginRowKeys), [deletingOriginRowKeys])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      updateNodeInternals(sourceId)
      requestFitView()
    })
    ro.observe(el)
    updateNodeInternals(sourceId)
    requestFitView()
    return () => ro.disconnect()
  }, [meta.name, rows.length, requestFitView, sourceId, updateNodeInternals])

  useEffect(() => {
    if (!adding && !editingKey) return
    let cancelled = false
    const loadFkOptions = async () => {
      const options: Record<string, RowRecord[]> = {}
      for (const col of meta.columns) {
        if (!col.foreign_key) continue
        try {
          const page = await exploreApi.listRows(col.foreign_key.table, { limit: 500, offset: 0 })
          options[col.name] = page.rows
        } catch {
          options[col.name] = []
        }
      }
      if (!cancelled) setFkOptions(options)
    }
    loadFkOptions()
    return () => {
      cancelled = true
    }
  }, [adding, editingKey, meta.columns])

  const activateFk = (
    row: RowRecord,
    rootRowKey: string,
    column: string,
    targetTable: string,
    refColumn: string,
    value: unknown,
  ) => {
    expandFk({
      schema,
      column,
      fkValue: value,
      targetTable,
      refColumn,
      origin: buildOriginFromTable(meta, row, rootRowKey, column),
    })
    requestFitView()
  }

  const startAdd = () => {
    setEditingKey(null)
    setDraft({})
    setAdding(true)
    onEnterEditMode()
  }

  const startEdit = (row: RowRecord) => {
    setAdding(false)
    setEditingKey(rowKey(schema, meta.name, row))
    setDraft({ ...row })
    onEnterEditMode()
  }

  const cancelEdit = () => {
    setAdding(false)
    setEditingKey(null)
    setDraft({})
  }

  const saveAdd = async () => {
    setBusy(true)
    try {
      await onCreateRow(draft)
      cancelEdit()
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async (row: RowRecord) => {
    setBusy(true)
    try {
      await onUpdateRow(rowPkMap(meta, row), draft)
      cancelEdit()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      ref={rootRef}
      className={clsx('explorer-node table-node', densityClass)}
      onClickCapture={(e) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>('[data-fk]')
        if (!target || target.dataset.fkEmpty === 'true') return
        e.stopPropagation()
        const rootRowKey = target.dataset.fkRow!
        const col = target.dataset.fkCol!
        const fkTable = target.dataset.fkTable!
        const refCol = target.dataset.fkRefCol!
        const row = rows.find((r) => rowKey(schema, meta.name, r) === rootRowKey)
        if (!row) return
        activateFk(row, rootRowKey, col, fkTable, refCol, row[col])
      }}
    >
      <div className="table-node__header">
        <div className="table-node__header-main">
          <span className="table-node__badge">
            <Table2 size={12} aria-hidden />
            таблица
          </span>
          <h3 className="table-node__title">{meta.label}</h3>
        </div>
        <div className="table-node__toolbar">
          <label className="table-node__search nopan nodrag nowheel">
            <Search size={14} aria-hidden className="table-node__search-icon" />
            <input
              type="search"
              className="table-node__search-input"
              value={idSearch}
              onChange={(e) => onIdSearchChange(e.target.value)}
              onPointerDown={stopFlowEvent}
              onMouseDown={stopFlowEvent}
              placeholder="Поиск по ID"
              aria-label="Поиск по ID"
            />
            {idSearch ? (
              <button
                type="button"
                className="table-node__search-clear"
                title="Очистить"
                onClick={() => onIdSearchChange('')}
                onPointerDown={stopFlowEvent}
                onMouseDown={stopFlowEvent}
              >
                <X size={12} />
              </button>
            ) : null}
          </label>
          <button type="button" className="table-node__icon-btn" title="Добавить" onClick={startAdd}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="table-node__body">
        <table className="table-node__grid">
          <thead>
            <tr>
              {meta.columns.map((col) => (
                <TableColumnHeader
                  key={col.name}
                  col={col}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={onSort}
                  filters={filters}
                  openedFilterCol={openedFilterCol}
                  setOpenedFilterCol={setOpenedFilterCol}
                  filterDraft={filterDraft}
                  setFilterDraft={setFilterDraft}
                  onSetFilter={onSetFilter}
                />
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {adding ? (
              <tr className="table-node__row table-node__row--editing">
                {meta.columns.map((col) => (
                  <td key={col.name} className="table-node__cell">
                    <TableEditorCell
                      schema={schema}
                      col={col}
                      row={null}
                      adding
                      draft={draft}
                      setDraft={setDraft}
                      fkOptions={fkOptions}
                    />
                  </td>
                ))}
                <td className="table-node__actions">
                  <button type="button" className="table-node__icon-btn" onClick={saveAdd} disabled={busy}>
                    <Check size={14} />
                  </button>
                  <button type="button" className="table-node__icon-btn" onClick={cancelEdit} disabled={busy}>
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const thisRowKey = rowKey(schema, meta.name, row)
              const isEditing = editingKey === thisRowKey
              return (
                <TableDataRow
                  key={thisRowKey}
                  schema={schema}
                  meta={meta}
                  row={row}
                  thisRowKey={thisRowKey}
                  isEditing={isEditing}
                  isDeleting={deletingSet.has(thisRowKey)}
                  busy={busy}
                  adding={adding}
                  draft={draft}
                  setDraft={setDraft}
                  fkOptions={fkOptions}
                  onSaveEdit={(r) => void saveEdit(r)}
                  onCancelEdit={cancelEdit}
                  onStartEdit={startEdit}
                  onDeleteRow={onDeleteRow}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const TableNode = memo(TableNodeComponent)
