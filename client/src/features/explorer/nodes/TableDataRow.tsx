import clsx from 'clsx'
import { Handle, Position } from '@xyflow/react'
import { Check, Link2, Pencil, Trash2, X } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { RowRecord, SchemaResponse, TableMeta } from '../../../types/schema'
import { formatCell, rowHandleId, rowPkMap } from '../utils/rowKey'
import { CellValue } from '../components/CellValue'
import { getTableMeta } from '../../../utils/schema'
import { TableEditorCell } from './TableEditorCell'

type Props = {
  schema: SchemaResponse
  meta: TableMeta
  row: RowRecord
  thisRowKey: string
  isEditing: boolean
  isDeleting: boolean
  busy: boolean
  adding: boolean
  draft: RowRecord
  setDraft: Dispatch<SetStateAction<RowRecord>>
  fkOptions: Record<string, RowRecord[]>
  onSaveEdit: (row: RowRecord) => void
  onCancelEdit: () => void
  onStartEdit: (row: RowRecord) => void
  onDeleteRow: (pk: Record<string, string>, rootRowKey: string) => void
}

export function TableDataRow({
  schema,
  meta,
  row,
  thisRowKey,
  isEditing,
  isDeleting,
  busy,
  adding,
  draft,
  setDraft,
  fkOptions,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDeleteRow,
}: Props) {
  return (
    <tr
      className={clsx('table-node__row', {
        'table-node__row--deleting': isDeleting,
      })}
    >
      {meta.columns.map((col, colIndex) => {
        const value = row[col.name]
        const fk = col.foreign_key
        const targetMeta = fk ? getTableMeta(schema, fk.table) : null
        const isEmpty = value === null || value === undefined
        const isLastCol = colIndex === meta.columns.length - 1

        return (
          <td key={col.name} className={clsx('table-node__cell', isLastCol && 'table-node__cell--row-end')}>
            {isEditing ? (
              <TableEditorCell
                schema={schema}
                col={col}
                row={row}
                adding={false}
                draft={draft}
                setDraft={setDraft}
                fkOptions={fkOptions}
              />
            ) : fk ? (
              <div className="fk-cell">
                <span
                  role="button"
                  tabIndex={isEmpty ? -1 : 0}
                  className={clsx('fk-link', { 'fk-link--empty': isEmpty })}
                  data-fk=""
                  data-fk-row={thisRowKey}
                  data-fk-col={col.name}
                  data-fk-table={fk.table}
                  data-fk-ref-col={fk.column}
                  data-fk-empty={isEmpty ? 'true' : 'false'}
                  title={isEmpty ? undefined : `Открыть: ${targetMeta?.label ?? fk.table}`}
                >
                  {formatCell(col.name, value, col.type)}
                  <Link2 size={12} className="fk-link__icon" aria-hidden />
                </span>
              </div>
            ) : (
              <CellValue column={col.name} value={value} columnType={col.type} />
            )}
            {isLastCol ? (
              <Handle
                type="source"
                position={Position.Right}
                id={rowHandleId(schema, meta.name, row)}
                className="explorer-handle explorer-handle--row-anchor"
                style={{
                  right: 0,
                  top: '50%',
                  transform: 'translate(50%, -50%)',
                }}
                isConnectable={false}
              />
            ) : null}
          </td>
        )
      })}
      <td className="table-node__actions">
        {isEditing ? (
          <>
            <button type="button" className="table-node__icon-btn" onClick={() => onSaveEdit(row)} disabled={busy}>
              <Check size={14} />
            </button>
            <button type="button" className="table-node__icon-btn" onClick={onCancelEdit} disabled={busy}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="table-node__icon-btn" onClick={() => onStartEdit(row)} disabled={busy || adding}>
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className="table-node__icon-btn"
              onClick={() => onDeleteRow(rowPkMap(meta, row), thisRowKey)}
              disabled={busy}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </td>
    </tr>
  )
}
