package app

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"lw-1/server/internal/config"
	"lw-1/server/internal/handler"
	appmiddleware "lw-1/server/internal/middleware"
)

func NewRouter(cfg *config.Config, h *handler.Handler) http.Handler {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Recoverer)
	r.Use(appmiddleware.CORS(cfg.CORSOrigins))

	r.Get("/", h.Root)

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", h.Health)
		r.Get("/schema/tables", h.GetSchema)
		r.Get("/tables/{table}/rows", h.ListTableRows)
		r.Post("/tables/{table}/rows", h.CreateTableRow)
		r.Get("/tables/{table}/row", h.GetTableRow)
		r.Patch("/tables/{table}/row", h.UpdateTableRow)
		r.Delete("/tables/{table}/row", h.DeleteTableRow)
	})

	return r
}
