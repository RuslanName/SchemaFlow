const DATE_COLUMN_TYPES = new Set(['date', 'timestamp'])

const DATE_COLUMNS = new Set([
  'hire_date',
  'sign_date',
  'date',
  'change_date',
  'status_change_date',
])

const LINK_COLUMNS = new Set(['file_link', 'photo_link'])

export function isLinkColumn(column: string): boolean {
  return LINK_COLUMNS.has(column)
}

const LINK_LABEL_MAX_LENGTH = 44

export function formatLinkLabel(url: string): string {
  if (url.length <= LINK_LABEL_MAX_LENGTH) return url
  const head = 24
  const tail = LINK_LABEL_MAX_LENGTH - head - 1
  return `${url.slice(0, head)}…${url.slice(-tail)}`
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

function hasMeaningfulTime(d: Date, raw: unknown): boolean {
  if (typeof raw === 'string' && /T\d{2}:\d{2}/.test(raw)) return true
  return (
    d.getHours() !== 0 ||
    d.getMinutes() !== 0 ||
    d.getSeconds() !== 0 ||
    d.getMilliseconds() !== 0
  )
}

export function formatHumanDate(
  value: unknown,
  columnType?: string,
): string {
  const d = parseDate(value)
  if (!d) return value === null || value === undefined ? '—' : String(value)

  const withTime =
    columnType === 'timestamp' || hasMeaningfulTime(d, value)

  if (withTime) {
    const datePart = d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const timePart = d.toLocaleTimeString('ru-RU', {
      hour: 'numeric',
      minute: '2-digit',
    })
    return `${datePart}, ${timePart}`
  }

  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatCellDisplay(
  column: string,
  value: unknown,
  columnType?: string,
): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)

  if (
    DATE_COLUMN_TYPES.has(columnType ?? '') ||
    DATE_COLUMNS.has(column)
  ) {
    return formatHumanDate(value, columnType)
  }

  return String(value)
}
