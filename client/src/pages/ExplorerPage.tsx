import { useState } from 'react'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Database } from 'lucide-react'
import { exploreApi } from '../api/explore'
import { SchemaProvider } from '../context/SchemaContext'
import { useExplorerStore } from '../store/explorerStore'
import { ExplorerCanvas } from '../features/explorer/ExplorerCanvas'
import { ReactFlowProvider } from '@xyflow/react'
import { tableIcon } from '../features/explorer/utils/icons'
import '../features/explorer/explorer.css'

export function ExplorerPage() {
  const activeTable = useExplorerStore((s) => s.activeTable)
  const setActiveTable = useExplorerStore((s) => s.setActiveTable)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const schemaQuery = useQuery({
    queryKey: ['schema'],
    queryFn: exploreApi.getSchema,
  })

  if (schemaQuery.isLoading) {
    return (
      <div className="explorer-page explorer-page--loading">
        <p>Загрузка схемы БД…</p>
      </div>
    )
  }

  if (schemaQuery.isError) {
    return (
      <div className="explorer-page explorer-page--error">
        <p>Не удалось загрузить схему: {schemaQuery.error.message}</p>
        <p className="explorer-page__hint">
          Запустите API-сервер и восстановите данные скриптом из <code>scripts/</code>
        </p>
      </div>
    )
  }

  const schema = schemaQuery.data!

  return (
    <SchemaProvider schema={schema}>
      <div
        className={clsx('explorer-page', {
          'explorer-page--sidebar-collapsed': !sidebarOpen,
        })}
      >
        <aside
          className={clsx('explorer-sidebar', {
            'explorer-sidebar--collapsed': !sidebarOpen,
          })}
        >
          <div
            className={clsx('explorer-sidebar__top', {
              'explorer-sidebar__top--collapsed': !sidebarOpen,
            })}
          >
            {sidebarOpen ? (
              <>
                <div className="explorer-sidebar__brand">
                  <Database
                    size={20}
                    className="explorer-sidebar__logo"
                    aria-hidden
                  />
                  <h1 className="explorer-sidebar__title">
                    БД «Учёт и оплата аренды кофемашин»
                  </h1>
                </div>
                <button
                  type="button"
                  className="explorer-sidebar__toggle"
                  onClick={() => setSidebarOpen(false)}
                  title="Свернуть панель"
                  aria-label="Свернуть панель"
                >
                  <ChevronLeft size={18} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="explorer-sidebar__toggle"
                onClick={() => setSidebarOpen(true)}
                title="Развернуть панель"
                aria-label="Развернуть панель"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          <nav className="explorer-table-list" aria-label="Таблицы">
            {schema.tables.map((table) => {
              const Icon = tableIcon(table.name)
              const isActive = table.name === activeTable
              return (
                <button
                  key={table.name}
                  type="button"
                  className={clsx('explorer-table-list__item', {
                    'explorer-table-list__item--active': isActive,
                  })}
                  onClick={() => setActiveTable(table.name)}
                  title={table.label}
                >
                  <Icon
                    size={18}
                    className="explorer-table-list__icon"
                    aria-hidden
                  />
                  {sidebarOpen && (
                    <span className="explorer-table-list__label">
                      {table.label}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="explorer-main">
          <ReactFlowProvider>
            <ExplorerCanvas />
          </ReactFlowProvider>
        </main>
      </div>
    </SchemaProvider>
  )
}
