import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Link2, X } from 'lucide-react'
import type { TableMeta, RowRecord } from '../../../types/schema'
import type { LinkOrigin } from '../utils/linkOrigin'
import { formatCell } from '../utils/rowKey'
import { CellValue } from '../components/CellValue'
import { columnLabel } from '../utils/columnLabels'
import { columnIcon } from '../utils/icons'
import { selectActiveDeletingOrigins, useExplorerStore } from '../../../store/explorerStore'
import { useSchema } from '../../../context/SchemaContext'
import { getTableMeta } from '../../../utils/schema'
import './nodes.css'

export type RecordCardNodeData = {
  meta: TableMeta
  row: RowRecord
  cardKey: string
  origin: LinkOrigin
  parentCardKey?: string
}

function RecordCardNodeComponent({ data }: NodeProps) {
  const schema = useSchema()
  const nodeData = data as RecordCardNodeData
  const { meta, row, cardKey, origin, parentCardKey } = nodeData
  const expandFk = useExplorerStore((s) => s.expandFk)
  const removeCard = useExplorerStore((s) => s.removeCard)
  const deletingOrigins = useExplorerStore(selectActiveDeletingOrigins)
  const requestFitView = useExplorerStore((s) => s.requestFitView)
  const isDeleting = deletingOrigins.includes(origin.rowKey)

  const activateFk = (
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
      origin,
      parentCardKey: cardKey,
    })
    requestFitView()
  }

  return (
    <motion.div
      className={clsx('explorer-node record-card', { 'record-card--deleting': isDeleting })}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={isDeleting ? { opacity: 0, scale: 0.9, y: -8 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onClickCapture={(e) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>('[data-fk]')
        if (!target || target.dataset.fkEmpty === 'true') return
        e.stopPropagation()
        const col = target.dataset.fkCol!
        activateFk(
          col,
          target.dataset.fkTable!,
          target.dataset.fkRefCol!,
          row[col],
        )
      }}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="card-out"
        className="explorer-handle explorer-handle--card-out"
        isConnectable={false}
      />

      {parentCardKey ? (
        <Handle
          type="target"
          position={Position.Bottom}
          id="target-bottom"
          className="explorer-handle explorer-handle--target-bottom"
        />
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="explorer-handle explorer-handle--target-left"
          style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}

      <div className="record-card__header">
        <div className="record-card__title-row">
          <h4 className="record-card__title">{meta.label}</h4>
          <button
            type="button"
            className="record-card__close"
            onClick={(e) => {
              e.stopPropagation()
              removeCard(cardKey)
            }}
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <dl className="record-card__fields nodrag">
        {meta.columns.map((col) => {
          const value = row[col.name]
          const fk = col.foreign_key
          const ColIcon = columnIcon(col)
          const targetMeta = fk ? getTableMeta(schema, fk.table) : null
          const isEmpty = value === null || value === undefined

          return (
            <div key={col.name} className="record-card__field">
              <dt>
                <ColIcon size={12} aria-hidden />
                {columnLabel(col.name)}
              </dt>
              <dd>
                {fk ? (
                  <div className="fk-cell">
                    <span
                      role="button"
                      tabIndex={isEmpty ? -1 : 0}
                      className={clsx('fk-link', { 'fk-link--empty': isEmpty })}
                      data-fk=""
                      data-fk-col={col.name}
                      data-fk-table={fk.table}
                      data-fk-ref-col={fk.column}
                      data-fk-empty={isEmpty ? 'true' : 'false'}
                      title={
                        isEmpty
                          ? undefined
                          : `Открыть: ${targetMeta?.label ?? fk.table}`
                      }
                    >
                      {formatCell(col.name, value, col.type)}
                      <Link2 size={12} className="fk-link__icon" aria-hidden />
                    </span>
                  </div>
                ) : (
                  <CellValue
                    column={col.name}
                    value={value}
                    columnType={col.type}
                  />
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </motion.div>
  )
}

export const RecordCardNode = memo(RecordCardNodeComponent)
