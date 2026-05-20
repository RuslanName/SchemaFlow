import { createContext, useContext, type ReactNode } from 'react'
import type { SchemaResponse } from '../types/schema'

const SchemaContext = createContext<SchemaResponse | null>(null)

export function SchemaProvider({
  schema,
  children,
}: {
  schema: SchemaResponse
  children: ReactNode
}) {
  return (
    <SchemaContext.Provider value={schema}>{children}</SchemaContext.Provider>
  )
}

export function useSchema(): SchemaResponse {
  const schema = useContext(SchemaContext)
  if (!schema) {
    throw new Error('SchemaProvider is required')
  }
  return schema
}
