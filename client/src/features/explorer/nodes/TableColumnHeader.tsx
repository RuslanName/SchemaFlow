import clsx from 'clsx'
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, Check, Funnel, X } from 'lucide-react'
import type { ColumnFilter } from '../../../store/explorerStore'
import type { ColumnMeta } from '../../../types/schema'
import { columnLabel } from '../utils/columnLabels'
import { columnIcon } from '../utils/icons'
import { isDateLikeColumnType, isNumericColumnType, isSortableColumnName } from './columnKinds'
import type { SortDir } from '../../../api/explore'
import type { Dispatch, SetStateAction } from 'react'

type Props = {
  col: ColumnMeta
  sortBy?: string
  sortDir: SortDir
  onSort: (column: string) => void
  filters: Record<string, ColumnFilter>
  openedFilterCol: string | null
  setOpenedFilterCol: Dispatch<SetStateAction<string | null>>
  filterDraft: ColumnFilter
  setFilterDraft: Dispatch<SetStateAction<ColumnFilter>>
  onSetFilter: (column: string, filter?: ColumnFilter) => void
}

export function TableColumnHeader({
  col,
  sortBy,
  sortDir,
  onSort,
  filters,
  openedFilterCol,
  setOpenedFilterCol,
  filterDraft,
  setFilterDraft,
  onSetFilter,
}: Props) {
  const ColIcon = columnIcon(col)
  const isAsc = sortBy === col.name && sortDir === 'asc'
  const isDesc = sortBy === col.name && sortDir === 'desc'
  const sortable = isSortableColumnName(col.name)
  const hasFilter = Boolean(filters[col.name])
  const isDate = isDateLikeColumnType(col.type)
  const isNumber = isNumericColumnType(col.type)

  const openFilter = (colName: string) => {
    setOpenedFilterCol(colName)
    setFilterDraft({ ...(filters[colName] ?? {}) })
  }

  const applyFilter = () => {
    if (!openedFilterCol) return
    onSetFilter(openedFilterCol, filterDraft)
    setOpenedFilterCol(null)
  }

  return (
    <th>
      <div className="col-header-wrap">
        <span className="col-header">
          <ColIcon size={13} aria-hidden />
          {columnLabel(col.name)}
        </span>
        <span className="col-header-actions">
          {sortable ? (
            <button type="button" className="table-node__icon-btn table-node__icon-btn--col" onClick={() => onSort(col.name)}>
              {isAsc ? <ArrowUpNarrowWide size={13} /> : isDesc ? <ArrowDownWideNarrow size={13} /> : <ArrowUpDown size={13} />}
            </button>
          ) : null}
          {isDate || isNumber ? (
            <button
              type="button"
              className={clsx('table-node__icon-btn table-node__icon-btn--col', hasFilter && 'table-node__icon-btn--active')}
              onClick={() => openFilter(col.name)}
            >
              <Funnel size={13} />
            </button>
          ) : null}
        </span>
      </div>
      {openedFilterCol === col.name ? (
        <div className="table-node__filter-popover">
          {isDate ? (
            <>
              <input
                className="table-node__input"
                type="date"
                value={filterDraft.from ?? ''}
                onChange={(e) => setFilterDraft((s) => ({ ...s, from: e.target.value }))}
                placeholder="С"
              />
              <input
                className="table-node__input"
                type="date"
                value={filterDraft.to ?? ''}
                onChange={(e) => setFilterDraft((s) => ({ ...s, to: e.target.value }))}
                placeholder="По"
              />
            </>
          ) : (
            <>
              <input
                className="table-node__input"
                type="number"
                value={filterDraft.min ?? ''}
                onChange={(e) => setFilterDraft((s) => ({ ...s, min: e.target.value }))}
                placeholder="Мин"
              />
              <input
                className="table-node__input"
                type="number"
                value={filterDraft.max ?? ''}
                onChange={(e) => setFilterDraft((s) => ({ ...s, max: e.target.value }))}
                placeholder="Макс"
              />
            </>
          )}
          <div className="table-node__filter-actions">
            <button type="button" className="table-node__icon-btn table-node__icon-btn--col" onClick={applyFilter}>
              <Check size={13} />
            </button>
            <button
              type="button"
              className="table-node__icon-btn table-node__icon-btn--col"
              onClick={() => {
                onSetFilter(col.name, undefined)
                setOpenedFilterCol(null)
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : null}
    </th>
  )
}
