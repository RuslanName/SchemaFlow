import {
  formatCellDisplay,
  formatLinkLabel,
  isLinkColumn,
} from '../utils/formatDisplay'
import { PasswordStars } from './PasswordStars'

type Props = {
  column: string
  value: unknown
  columnType?: string
}

export function CellValue({ column, value, columnType }: Props) {
  if (column === 'password_hash' && value !== null && value !== undefined) {
    return <PasswordStars />
  }

  if (isLinkColumn(column) && value !== null && value !== undefined) {
    const href = String(value)
    return (
      <a
        className="cell-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={href}
      >
        {formatLinkLabel(href)}
      </a>
    )
  }

  return (
    <span className="cell-value">
      {formatCellDisplay(column, value, columnType)}
    </span>
  )
}
