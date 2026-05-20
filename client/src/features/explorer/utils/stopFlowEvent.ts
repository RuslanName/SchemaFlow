import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react'

export function stopFlowEvent(
  e: ReactPointerEvent | ReactMouseEvent,
) {
  e.stopPropagation()
}
