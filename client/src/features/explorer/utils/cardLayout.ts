import type { RecordCard } from '../../../store/explorerStore'

const TABLE = { x: 0, y: -40, w: 700, h: 400 }
const CARD = { w: 300, h: 420 }
const GAP = 72

type Rect = { x: number; y: number; w: number; h: number }

function overlaps(a: Rect, b: Rect, gap: number): boolean {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  )
}

function cardRect(pos: { x: number; y: number }): Rect {
  return { x: pos.x, y: pos.y, w: CARD.w, h: CARD.h }
}

function isFree(candidate: Rect, cards: RecordCard[]): boolean {
  if (overlaps(candidate, TABLE, GAP)) return false
  for (const c of cards) {
    if (overlaps(candidate, cardRect(c.position), GAP)) return false
  }
  return true
}

function candidateSlots(): { x: number; y: number }[] {
  const slots: { x: number; y: number }[] = []
  const baseX = TABLE.x + TABLE.w + GAP
  const centerY = TABLE.y + TABLE.h / 2 - CARD.h / 2

  const offsets = [
    { x: 0, y: 0 },
    { x: 0, y: -(CARD.h + GAP) },
    { x: 0, y: CARD.h + GAP },
    { x: CARD.w + GAP, y: 0 },
    { x: CARD.w + GAP, y: -(CARD.h + GAP) / 2 },
    { x: CARD.w + GAP, y: (CARD.h + GAP) / 2 },
    { x: 0, y: -(CARD.h + GAP) * 2 },
    { x: 0, y: (CARD.h + GAP) * 2 },
    { x: (CARD.w + GAP) * 2, y: 0 },
    { x: (CARD.w + GAP) * 2, y: -CARD.h },
    { x: (CARD.w + GAP) * 2, y: CARD.h },
    { x: -CARD.w - GAP, y: 0 },
    { x: -CARD.w - GAP, y: -CARD.h / 2 },
    { x: TABLE.w / 2 - CARD.w / 2, y: TABLE.h + GAP },
  ]

  for (let ring = 0; ring < 4; ring++) {
    const ringShift = ring * 48
    for (const o of offsets) {
      slots.push({
        x: baseX + o.x + ringShift,
        y: centerY + o.y + (ring % 2 === 0 ? 0 : 36),
      })
    }
  }

  return slots
}

function findAboveParent(
  parent: RecordCard,
  existingCards: RecordCard[],
): { x: number; y: number } {
  const siblings = existingCards.filter((c) => c.parentCardKey === parent.key)
  let baseY = parent.position.y - CARD.h - GAP
  if (siblings.length > 0) {
    const highest = siblings.reduce((a, b) =>
      a.position.y < b.position.y ? a : b,
    )
    baseY = highest.position.y - CARD.h - GAP
  }

  const offsets = [
    { x: 0, y: 0 },
    { x: CARD.w + GAP, y: 0 },
    { x: -(CARD.w + GAP), y: 0 },
    { x: 0, y: -(CARD.h + GAP) },
    { x: CARD.w + GAP, y: -(CARD.h + GAP) },
    { x: -(CARD.w + GAP), y: -(CARD.h + GAP) },
  ]

  for (const o of offsets) {
    const slot = { x: parent.position.x + o.x, y: baseY + o.y }
    if (isFree(cardRect(slot), existingCards)) return slot
  }

  return { x: parent.position.x, y: baseY }
}

export function findCardPosition(
  existingCards: RecordCard[],
  parentCardKey?: string,
): { x: number; y: number } {
  if (parentCardKey) {
    const parent = existingCards.find((c) => c.key === parentCardKey)
    if (parent) return findAboveParent(parent, existingCards)
  }

  for (const slot of candidateSlots()) {
    const rect = cardRect(slot)
    if (isFree(rect, existingCards)) return slot
  }

  const n = existingCards.length
  return {
    x: TABLE.x + TABLE.w + GAP + (n % 3) * (CARD.w + GAP),
    y: TABLE.y + Math.floor(n / 3) * (CARD.h + GAP) + 80,
  }
}
