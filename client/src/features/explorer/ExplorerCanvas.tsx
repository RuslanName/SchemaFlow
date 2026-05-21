import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ReactFlow,
  Background,
  MiniMap,
  applyNodeChanges,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type Viewport,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { TableNode } from './nodes/TableNode'
import { RecordCardNode } from './nodes/RecordCardNode'
import { WaveEdge } from './edges/WaveEdge'
import { ExplorerControls } from './components/ExplorerControls'
import { TabViewportController, FitViewController } from './components/ExplorerFlowControllers'
import { matchesFilters } from './utils/matchesFilters'
import { matchesIdSearch } from './utils/matchesIdSearch'
import { buildFlowNodesWithSchema } from './utils/buildFlowNodes'
import {
  useExplorerStore,
  tableNodeId,
  selectActiveCards,
  selectActiveEdges,
  selectActiveDeletingOrigins,
  selectActiveFilters,
  selectActiveIdSearch,
} from '../../store/explorerStore'
import { useSchema } from '../../context/SchemaContext'
import { exploreApi } from '../../api/explore'
import { getTableMeta } from '../../utils/schema'
import type { RowRecord } from '../../types/schema'
import { rowKey } from './utils/rowKey'

const nodeTypes = {
  table: TableNode,
  record: RecordCardNode,
}

const edgeTypes = {
  wave: WaveEdge,
}

const ROWS_LIMIT = 500

export function ExplorerCanvas() {
  const schema = useSchema()
  const activeTable = useExplorerStore((s) => s.activeTable)
  const cards = useExplorerStore(selectActiveCards)
  const graphEdges = useExplorerStore(selectActiveEdges)
  const deletingOriginRowKeys = useExplorerStore(selectActiveDeletingOrigins)
  const fitViewTick = useExplorerStore((s) => s.fitViewTick)
  const updateCardPosition = useExplorerStore((s) => s.updateCardPosition)
  const requestFitView = useExplorerStore((s) => s.requestFitView)
  const setTabViewport = useExplorerStore((s) => s.setTabViewport)
  const sortBy = useExplorerStore((s) => s.sortBy)
  const sortDir = useExplorerStore((s) => s.sortDir)
  const filters = useExplorerStore(selectActiveFilters)
  const idSearch = useExplorerStore(selectActiveIdSearch)
  const setSort = useExplorerStore((s) => s.setSort)
  const setColumnFilter = useExplorerStore((s) => s.setColumnFilter)
  const setIdSearch = useExplorerStore((s) => s.setIdSearch)
  const removeCardsByOrigin = useExplorerStore((s) => s.removeCardsByOrigin)
  const setDeletingOrigin = useExplorerStore((s) => s.setDeletingOrigin)
  const queryClient = useQueryClient()
  const { fitView } = useReactFlow()
  const [pauseGlobalFitView, setPauseGlobalFitView] = useState(false)

  const onSort = useCallback(
    (column: string) => {
      if (sortBy !== column) {
        setSort(column, 'asc')
        return
      }
      if (sortDir === 'asc') {
        setSort(column, 'desc')
        return
      }
      setSort(undefined, 'asc')
    },
    [setSort, sortBy, sortDir],
  )

  const refetchRows = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['rows', activeTable] })
  }, [activeTable, queryClient])

  const onCreateRow = useCallback(
    async (payload: RowRecord) => {
      await exploreApi.createRow(activeTable, payload)
      await refetchRows()
    },
    [activeTable, refetchRows],
  )

  const onUpdateRow = useCallback(
    async (pk: Record<string, string>, payload: RowRecord) => {
      await exploreApi.updateRow(activeTable, pk, payload)
      await refetchRows()
    },
    [activeTable, refetchRows],
  )

  const onDeleteRow = useCallback(
    async (pk: Record<string, string>, rootRowKey: string) => {
      setDeletingOrigin(rootRowKey, true)
      await new Promise((resolve) => window.setTimeout(resolve, 240))
      await exploreApi.deleteRow(activeTable, pk)
      removeCardsByOrigin(rootRowKey)
      await refetchRows()
      setDeletingOrigin(rootRowKey, false)
    },
    [activeTable, refetchRows, removeCardsByOrigin, setDeletingOrigin],
  )

  const onEnterEditMode = useCallback(() => {
    setPauseGlobalFitView(true)
    window.setTimeout(() => {
      fitView({
        nodes: [{ id: tableNodeId(activeTable) }],
        padding: 0.18,
        duration: 220,
        minZoom: 0.08,
        maxZoom: 1.25,
      })
    }, 0)
    window.setTimeout(() => {
      setPauseGlobalFitView(false)
    }, 450)
  }, [activeTable, fitView])

  const rowsQuery = useQuery({
    queryKey: ['rows', activeTable, sortBy ?? '', sortDir],
    queryFn: () =>
      exploreApi.listRows(activeTable, {
        limit: ROWS_LIMIT,
        offset: 0,
        sortBy,
        sortDir,
      }),
  })

  const rows = rowsQuery.data?.rows ?? []
  const meta = getTableMeta(schema, activeTable)
  const onIdSearchChange = useCallback(
    (query: string) => setIdSearch(activeTable, query),
    [activeTable, setIdSearch],
  )

  const visibleRows = useMemo(() => {
    if (!meta) return rows
    return rows.filter(
      (row) => matchesFilters(meta, row, filters) && matchesIdSearch(meta, row, idSearch),
    )
  }, [filters, idSearch, meta, rows])
  const visibleRowKeys = useMemo(
    () => new Set(visibleRows.map((r) => rowKey(schema, activeTable, r))),
    [activeTable, schema, visibleRows],
  )
  const visibleCards = useMemo(
    () =>
      cards.filter(
        (c) => c.origin.tableName !== activeTable || visibleRowKeys.has(c.origin.rowKey),
      ),
    [activeTable, cards, visibleRowKeys],
  )
  const visibleCardKeys = useMemo(() => new Set(visibleCards.map((c) => c.key)), [visibleCards])
  const visibleGraphEdges = useMemo(
    () =>
      graphEdges.filter(
        (e) =>
          (e.source === tableNodeId(activeTable) || visibleCardKeys.has(e.source)) &&
          visibleCardKeys.has(e.target),
      ),
    [activeTable, graphEdges, visibleCardKeys],
  )

  const flowNodes = useMemo(
    () =>
      buildFlowNodesWithSchema(
        schema,
        activeTable,
        visibleCards,
        visibleRows,
        sortBy,
        sortDir,
        onSort,
        onCreateRow,
        onUpdateRow,
        onDeleteRow,
        deletingOriginRowKeys,
        onEnterEditMode,
        filters,
        setColumnFilter,
        idSearch,
        onIdSearchChange,
      ),
    [
      activeTable,
      visibleCards,
      deletingOriginRowKeys,
      filters,
      idSearch,
      onIdSearchChange,
      onCreateRow,
      onDeleteRow,
      onEnterEditMode,
      onSort,
      onUpdateRow,
      visibleRows,
      schema,
      sortBy,
      sortDir,
    ],
  )

  const nodesStructureKey = useMemo(() => {
    const rowIds = visibleRows.map((r) => rowKey(schema, activeTable, r)).join(',')
    const cardIds = visibleCards.map((c) => c.key).join(',')
    const filterSig = JSON.stringify(filters)
    return `${activeTable}|${rowIds}|${cardIds}|${sortBy ?? ''}|${sortDir}|${filterSig}|${idSearch}`
  }, [activeTable, visibleRows, visibleCards, schema, sortBy, sortDir, filters, idSearch])

  const flowEdges = useMemo<Edge[]>(
    () =>
      visibleGraphEdges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
        type: 'wave',
      })),
    [visibleGraphEdges],
  )

  const [nodes, setNodes] = useState<Node[]>(flowNodes)
  const flowNodesRef = useRef(flowNodes)
  flowNodesRef.current = flowNodes

  useEffect(() => {
    setNodes(flowNodesRef.current)
  }, [nodesStructureKey])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
      for (const change of changes) {
        if (change.type !== 'position' || !change.position) continue
        if (change.dragging) continue
        const isCard = cards.some((c) => c.key === change.id)
        if (isCard) {
          updateCardPosition(change.id, change.position)
        }
      }
    },
    [cards, updateCardPosition],
  )

  const onMoveEnd = useCallback(
    (_: unknown, viewport: Viewport) => {
      setTabViewport(activeTable, viewport)
    },
    [activeTable, setTabViewport],
  )

  if (rowsQuery.isLoading) {
    return (
      <div className="explorer-canvas explorer-canvas--loading">
        <p>Загрузка данных таблицы…</p>
      </div>
    )
  }

  if (rowsQuery.isError) {
    return (
      <div className="explorer-canvas explorer-canvas--error">
        <p>Ошибка загрузки: {rowsQuery.error.message}</p>
      </div>
    )
  }

  return (
    <div className="explorer-canvas">
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.05}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        zoomOnDoubleClick={false}
        selectionOnDrag={false}
        elementsSelectable={false}
        nodesConnectable={false}
        noPanClassName="nopan"
        noDragClassName="nodrag"
        noWheelClassName="nowheel"
        proOptions={{ hideAttribution: true }}
      >
        <TabViewportController activeTable={activeTable} />
        <FitViewController fitViewTick={fitViewTick} pauseGlobalFitView={pauseGlobalFitView} />
        <Background gap={20} size={1} color="#cbd5e1" />
        <Panel position="bottom-left" className="explorer-controls-panel">
          <ExplorerControls onFitView={requestFitView} />
        </Panel>
        <MiniMap
          className="explorer-minimap"
          position="bottom-right"
          nodeColor={(n) => (n.type === 'table' ? '#64748b' : '#94a3b8')}
          nodeStrokeColor="#fff"
          nodeStrokeWidth={1.5}
          maskColor="rgba(15, 23, 42, 0.4)"
          bgColor="#ffffff"
        />
      </ReactFlow>
    </div>
  )
}
