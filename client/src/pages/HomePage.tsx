import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { HealthResponse } from '../types/api'

export function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<HealthResponse>('/api/health')
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>LW-1</h1>
      <p>Клиент подключён к API.</p>
      {health && <p>Сервер: {health.status}</p>}
      {error && <p style={{ color: 'crimson' }}>Ошибка: {error}</p>}
    </main>
  )
}
