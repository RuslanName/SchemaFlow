import { create } from 'zustand'
import { resolveFkRow } from '../api/resolveFk'
import { getTableMeta } from '../utils/schema'
import type { RowRecord, SchemaResponse } from '../types/schema'
import type { SortDir } from '../api/explore'
import { rowKey } from '../features/explorer/utils/rowKey'
import type { LinkOrigin } from '../features/explorer/utils/linkOrigin'
import { findCardPosition } from '../features/explorer/utils/cardLayout'

export type RecordCard = {
  key: string
  table: string
  row: RowRecord
  position: { x: number; y: number }
  origin: LinkOrigin
  parentCardKey?: string
}

export type GraphEdge = {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
}

export type ViewportState = {
  x: number
  y: number
  zoom: number
}

export type ColumnFilter = {
  min?: string
  max?: string
  from?: string
  to?: string
}

export type TableSession = {
  cards: RecordCard[]
  edges: GraphEdge[]
  viewport?: ViewportState
  deletingOriginRowKeys?: string[]
}

export type ExpandFkParams = {
  schema: SchemaResponse
  column: string
  fkValue: unknown
  targetTable: string
  refColumn: string
  origin: LinkOrigin
  parentCardKey?: string
}

const EMPTY_SESSION: TableSession = { cards: [], edges: [] }
const EMPTY_DELETING_ORIGINS: string[] = []

function resolveEdgeAnchor(params: ExpandFkParams) {
  if (params.parentCardKey) {
    return {
      source: params.parentCardKey,
      sourceHandle: 'card-out',
      targetHandle: 'target-bottom',
    }
  }
  return {
    source: tableNodeId(params.origin.tableName),
    sourceHandle: `row-${params.origin.rowKey}-anchor`,
    targetHandle: 'target',
  }
}

function getSession(
  sessions: Record<string, TableSession>,
  table: string,
): TableSession {
  return sessions[table] ?? EMPTY_SESSION
}

type ExplorerState = {
  activeTable: string
  sessions: Record<string, TableSession>
  fitViewTick: number
  sortBy?: string
  sortDir: SortDir
  filters: Record<string, ColumnFilter>
  setActiveTable: (table: string) => void
  setTabViewport: (table: string, viewport: ViewportState) => void
  setSort: (sortBy?: string, sortDir?: SortDir) => void
  setColumnFilter: (column: string, filter?: ColumnFilter) => void
  expandFk: (params: ExpandFkParams) => Promise<void>
  updateCardPosition: (key: string, position: { x: number; y: number }) => void
  removeCard: (key: string) => void
  removeCardsByOrigin: (originRowKey: string) => void
  setDeletingOrigin: (originRowKey: string, deleting: boolean) => void
  requestFitView: () => void
}

const TABLE_NODE_PREFIX = 'table:'

export function tableNodeId(table: string) {
  return `${TABLE_NODE_PREFIX}${table}`
}

export const selectActiveCards = (s: ExplorerState) =>
  getSession(s.sessions, s.activeTable).cards

export const selectActiveEdges = (s: ExplorerState) =>
  getSession(s.sessions, s.activeTable).edges

export const selectActiveViewport = (s: ExplorerState) =>
  getSession(s.sessions, s.activeTable).viewport

export const selectActiveDeletingOrigins = (s: ExplorerState) =>
  getSession(s.sessions, s.activeTable).deletingOriginRowKeys ?? EMPTY_DELETING_ORIGINS

export const selectActiveFilters = (s: ExplorerState) => s.filters

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  activeTable: 'contracts',
  sessions: {},
  fitViewTick: 0,
  sortDir: 'asc',
  filters: {},

  requestFitView: () => {
    set({ fitViewTick: get().fitViewTick + 1 })
  },

  setActiveTable: (table) => {
    if (table === get().activeTable) return
    set({ activeTable: table })
  },

  setTabViewport: (table, viewport) => {
    const { sessions } = get()
    const current = getSession(sessions, table)
    set({
      sessions: {
        ...sessions,
        [table]: { ...current, viewport },
      },
    })
  },

  setSort: (sortBy, sortDir = 'asc') => {
    set({ sortBy, sortDir })
  },

  setColumnFilter: (column, filter) => {
    const prev = get().filters
    const next = { ...prev }
    if (!filter) {
      delete next[column]
    } else {
      const cleaned: ColumnFilter = {}
      if (filter.min !== undefined && filter.min !== '') cleaned.min = filter.min
      if (filter.max !== undefined && filter.max !== '') cleaned.max = filter.max
      if (filter.from !== undefined && filter.from !== '') cleaned.from = filter.from
      if (filter.to !== undefined && filter.to !== '') cleaned.to = filter.to
      if (Object.keys(cleaned).length === 0) {
        delete next[column]
      } else {
        next[column] = cleaned
      }
    }
    set({ filters: next })
  },

  expandFk: async (params) => {
    const { schema, fkValue, targetTable, refColumn, origin } = params
    if (fkValue === null || fkValue === undefined || fkValue === '') return

    const targetMeta = getTableMeta(schema, targetTable)
    if (!targetMeta) return

    const row = await resolveFkRow(schema, targetTable, refColumn, fkValue)
    if (!row) return

    const key = rowKey(schema, targetTable, row)
    const state = get()
    const { activeTable, sessions } = state
    const session = getSession(sessions, activeTable)
    const anchor = resolveEdgeAnchor(params)
    const edgeId = `${anchor.source}:${anchor.sourceHandle}->${key}`

    if (session.cards.some((c) => c.key === key)) {
      if (!session.edges.some((e) => e.id === edgeId)) {
        set({
          sessions: {
            ...sessions,
            [activeTable]: {
              ...session,
              edges: [
                ...session.edges,
                { id: edgeId, ...anchor, target: key },
              ],
            },
          },
        })
      }
      return
    }

    const position = params.parentCardKey
      ? findCardPosition(session.cards, params.parentCardKey)
      : findCardPosition(session.cards)

    set({
      sessions: {
        ...sessions,
        [activeTable]: {
          ...session,
          cards: [
            ...session.cards,
            {
              key,
              table: targetTable,
              row,
              position,
              origin,
              parentCardKey: params.parentCardKey,
            },
          ],
          edges: [...session.edges, { id: edgeId, ...anchor, target: key }],
        },
      },
      fitViewTick: state.fitViewTick + 1,
    })
  },

  updateCardPosition: (key, position) => {
    const { activeTable, sessions } = get()
    const session = getSession(sessions, activeTable)
    set({
      sessions: {
        ...sessions,
        [activeTable]: {
          ...session,
          cards: session.cards.map((c) =>
            c.key === key ? { ...c, position } : c,
          ),
        },
      },
    })
  },

  removeCard: (key) => {
    const { activeTable, sessions } = get()
    const session = getSession(sessions, activeTable)
    const queue = [key]
    const remove = new Set<string>([key])
    while (queue.length > 0) {
      const current = queue.shift()!
      for (const card of session.cards) {
        if (card.parentCardKey === current && !remove.has(card.key)) {
          remove.add(card.key)
          queue.push(card.key)
        }
      }
    }
    set({
      sessions: {
        ...sessions,
        [activeTable]: {
          ...session,
          cards: session.cards.filter((c) => !remove.has(c.key)),
          edges: session.edges.filter(
            (e) => !remove.has(e.target) && !remove.has(e.source),
          ),
        },
      },
    })
  },

  removeCardsByOrigin: (originRowKey) => {
    const { activeTable, sessions } = get()
    const session = getSession(sessions, activeTable)
    const keys = new Set(
      session.cards
        .filter((c) => c.origin.tableName === activeTable && c.origin.rowKey === originRowKey)
        .map((c) => c.key),
    )
    set({
      sessions: {
        ...sessions,
        [activeTable]: {
          ...session,
          cards: session.cards.filter((c) => !keys.has(c.key)),
          edges: session.edges.filter(
            (e) => !keys.has(e.target) && !keys.has(e.source),
          ),
        },
      },
    })
  },

  setDeletingOrigin: (originRowKey, deleting) => {
    const { activeTable, sessions } = get()
    const session = getSession(sessions, activeTable)
    const current = new Set(session.deletingOriginRowKeys ?? [])
    if (deleting) {
      current.add(originRowKey)
    } else {
      current.delete(originRowKey)
    }
    set({
      sessions: {
        ...sessions,
        [activeTable]: {
          ...session,
          deletingOriginRowKeys: [...current],
        },
      },
    })
  },
}))
