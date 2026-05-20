import { useReactFlow } from '@xyflow/react'
import { Maximize2, Minus, Plus } from 'lucide-react'

type Props = {
  onFitView?: () => void
}

export function ExplorerControls({ onFitView }: Props) {
  const { zoomIn, zoomOut, fitView, getNodes } = useReactFlow()

  const handleFit = () => {
    const ids = getNodes().map((n) => ({ id: n.id }))
    if (ids.length > 0) {
      fitView({
        nodes: ids,
        padding: 0.18,
        duration: 300,
        minZoom: 0.08,
        maxZoom: 1.25,
      })
    }
    onFitView?.()
  }

  return (
    <div className="explorer-controls nodrag nopan">
      <button
        type="button"
        className="explorer-controls__btn"
        onClick={() => zoomIn({ duration: 200 })}
        title="Приблизить"
        aria-label="Приблизить"
      >
        <Plus size={18} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="explorer-controls__btn"
        onClick={() => zoomOut({ duration: 200 })}
        title="Отдалить"
        aria-label="Отдалить"
      >
        <Minus size={18} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="explorer-controls__btn"
        onClick={handleFit}
        title="Вписать в экран"
        aria-label="Вписать в экран"
      >
        <Maximize2 size={17} strokeWidth={2} />
      </button>
    </div>
  )
}
