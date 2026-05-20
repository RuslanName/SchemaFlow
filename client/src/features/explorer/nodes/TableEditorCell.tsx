import type { Dispatch, SetStateAction } from 'react'
import type { RowRecord, SchemaResponse, ColumnMeta } from '../../../types/schema'
import { formatCell } from '../utils/rowKey'
import { getTableMeta } from '../../../utils/schema'
import { inputTypeForSchemaType } from './tableInputType'

type Props = {
  schema: SchemaResponse
  col: ColumnMeta
  row: RowRecord | null
  adding: boolean
  draft: RowRecord
  setDraft: Dispatch<SetStateAction<RowRecord>>
  fkOptions: Record<string, RowRecord[]>
}

export function TableEditorCell({ schema, col, row, adding, draft, setDraft, fkOptions }: Props) {
  const value = draft[col.name] ?? ''
  if (col.is_primary) {
    return <span className="cell-value">{row ? String(row[col.name] ?? '') : ''}</span>
  }
  if (!adding && col.foreign_key) {
    return <span className="cell-value">{formatCell(col.name, row?.[col.name], col.type)}</span>
  }
  if (col.foreign_key) {
    const targetMeta = getTableMeta(schema, col.foreign_key.table)
    const targetPk = targetMeta?.primary_key[0]
    return (
      <select
        className="table-node__input"
        value={String(value)}
        onChange={(e) => setDraft((s) => ({ ...s, [col.name]: e.target.value }))}
      >
        <option value="">-</option>
        {(fkOptions[col.name] ?? []).map((opt) => {
          const key = targetPk ? String(opt[targetPk] ?? '') : JSON.stringify(opt)
          return (
            <option key={key} value={key}>
              {formatCell(col.name, key, col.type)}
            </option>
          )
        })}
      </select>
    )
  }
  return (
    <input
      className="table-node__input"
      type={inputTypeForSchemaType(col.type)}
      value={String(value)}
      onChange={(e) => setDraft((s) => ({ ...s, [col.name]: e.target.value }))}
    />
  )
}
