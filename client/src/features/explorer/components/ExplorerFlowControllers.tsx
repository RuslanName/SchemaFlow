import { useEffect, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useExplorerStore } from '../../../store/explorerStore'

export function TabViewportController({ activeTable }: { activeTable: string }) {
  const setTabViewport = useExplorerStore((s) => s.setTabViewport)
  const requestFitView = useExplorerStore((s) => s.requestFitView)
  const { setViewport, getViewport } = useReactFlow()
  const prevTableRef = useRef(activeTable)

  useEffect(() => {
    const prev = prevTableRef.current
    if (prev === activeTable) return

    setTabViewport(prev, getViewport())

    const nextViewport = useExplorerStore.getState().sessions[activeTable]?.viewport
    if (nextViewport) {
      setViewport(nextViewport, { duration: 0 })
    } else {
      requestFitView()
    }

    prevTableRef.current = activeTable
  }, [activeTable, getViewport, requestFitView, setTabViewport, setViewport])

  useEffect(() => {
    return () => {
      setTabViewport(activeTable, getViewport())
    }
  }, [activeTable, getViewport, setTabViewport])

  return null
}

export function FitViewController({
  fitViewTick,
  pauseGlobalFitView,
}: {
  fitViewTick: number
  pauseGlobalFitView: boolean
}) {
  const { fitView, getNodes } = useReactFlow()
  const lastAppliedTickRef = useRef(fitViewTick)

  useEffect(() => {
    if (pauseGlobalFitView) {
      lastAppliedTickRef.current = fitViewTick
      return
    }
    if (fitViewTick === lastAppliedTickRef.current) return
    lastAppliedTickRef.current = fitViewTick
    const t = window.setTimeout(() => {
      const ids = getNodes().map((n) => ({ id: n.id }))
      if (ids.length === 0) return
      fitView({
        nodes: ids,
        padding: 0.18,
        duration: 280,
        minZoom: 0.08,
        maxZoom: 1.25,
      })
    }, 80)
    return () => window.clearTimeout(t)
  }, [fitViewTick, fitView, getNodes, pauseGlobalFitView])

  return null
}
