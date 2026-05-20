import { memo, useEffect, useRef, useState } from 'react'
import { BaseEdge, type EdgeProps } from '@xyflow/react'
import {
  selectActiveCards,
  selectActiveDeletingOrigins,
  useExplorerStore,
} from '../../../store/explorerStore'

function buildWavePath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  phase: number,
): string {
  const dx = tx - sx
  const dy = ty - sy
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const shoulder = Math.min(14, Math.max(4, len * 0.05))
  const steps = Math.max(24, Math.ceil(len / 8))
  const amplitude = Math.min(20, 8 + len * 0.035)
  const waves = 2.5
  const nx = -uy
  const ny = ux

  const wx0 = sx + ux * shoulder
  const wy0 = sy + uy * shoulder
  const wx1 = tx - ux * shoulder
  const wy1 = ty - uy * shoulder
  const wdx = wx1 - wx0
  const wdy = wy1 - wy0

  const points: string[] = [`M ${sx} ${sy}`]
  if (len > shoulder * 1.5) {
    points.push(`L ${wx0} ${wy0}`)
  }

  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const envelope = Math.sin(t * Math.PI) ** 2.2
    const x = wx0 + wdx * t
    const y = wy0 + wdy * t
    const wave =
      amplitude * envelope * Math.sin(t * Math.PI * 2 * waves + phase)
    points.push(`L ${x + nx * wave} ${y + ny * wave}`)
  }

  if (len > shoulder * 1.5) {
    points.push(`L ${wx1} ${wy1}`)
  }
  points.push(`L ${tx} ${ty}`)
  return points.join(' ')
}

function WaveEdgeComponent({
  id,
  sourceX,
  sourceY,
  target,
  targetX,
  targetY,
  selected,
}: EdgeProps) {
  const cards = useExplorerStore(selectActiveCards)
  const deletingOrigins = useExplorerStore(selectActiveDeletingOrigins)
  const targetCard = cards.find((c) => c.key === target)
  const isDeleting = targetCard ? deletingOrigins.includes(targetCard.origin.rowKey) : false
  const coordsRef = useRef({ sourceX, sourceY, targetX, targetY })
  coordsRef.current = { sourceX, sourceY, targetX, targetY }

  const [path, setPath] = useState(() =>
    buildWavePath(sourceX, sourceY, targetX, targetY, 0),
  )

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const phase = ((now - start) / 1000) * Math.PI * 1.6
      const { sourceX: sx, sourceY: sy, targetX: tx, targetY: ty } =
        coordsRef.current
      setPath(buildWavePath(sx, sy, tx, ty, phase))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <BaseEdge
        id={`${id}-glow`}
        path={path}
        style={{
          stroke: selected ? '#a5b4fc' : '#818cf8',
          strokeWidth: 7,
          opacity: isDeleting ? 0.05 : 0.22,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />
      <BaseEdge
        id={id}
        path={path}
        className="wave-edge__line"
        style={{
          stroke: selected ? '#c7d2fe' : '#6366f1',
          strokeWidth: 2.5,
          opacity: isDeleting ? 0.3 : 1,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none',
        }}
      />
    </>
  )
}

export const WaveEdge = memo(WaveEdgeComponent)
