export function isPasswordHashColumn(name: string): boolean {
  return name === 'password_hash'
}

export function isSortableColumnName(name: string): boolean {
  return !isPasswordHashColumn(name)
}

export function isDateLikeColumnType(type: string): boolean {
  const t = type.toLowerCase()
  return t.includes('date') || t.includes('timestamp')
}

export function isNumericColumnType(type: string): boolean {
  const t = type.toLowerCase()
  return t.includes('int') || t.includes('numeric') || t.includes('decimal')
}
