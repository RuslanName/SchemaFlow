export function inputTypeForSchemaType(type: string): 'date' | 'datetime-local' | 'number' | 'text' {
  const normalized = type.toLowerCase()
  if (normalized.includes('date') && !normalized.includes('timestamp')) return 'date'
  if (normalized.includes('timestamp')) return 'datetime-local'
  if (normalized.includes('int') || normalized.includes('numeric') || normalized.includes('decimal')) {
    return 'number'
  }
  return 'text'
}
