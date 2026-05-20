package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"lw-1/server/internal/schema"
	"lw-1/server/internal/service"
)

func (h *Handler) ListTableRows(w http.ResponseWriter, r *http.Request) {
	tableName := chi.URLParam(r, "table")
	if tableName == "" {
		writeError(w, http.StatusBadRequest, "table is required")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	sortBy := r.URL.Query().Get("sort_by")
	sortDir := r.URL.Query().Get("sort_dir")

	page, err := h.svc.ListRows(r.Context(), tableName, limit, offset, sortBy, sortDir)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			writeError(w, http.StatusNotFound, "table not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, page)
}

func (h *Handler) GetTableRow(w http.ResponseWriter, r *http.Request) {
	tableName := chi.URLParam(r, "table")
	if tableName == "" {
		writeError(w, http.StatusBadRequest, "table is required")
		return
	}

	tbl := schema.ByName(tableName)
	if tbl == nil {
		writeError(w, http.StatusNotFound, "table not found")
		return
	}

	pk := make(map[string]string, len(tbl.PrimaryKey))
	for _, col := range tbl.PrimaryKey {
		val := r.URL.Query().Get(col)
		if val == "" {
			writeValidationError(w, map[string]string{
				col: "required",
			})
			return
		}
		pk[col] = val
	}

	row, err := h.svc.GetRow(r.Context(), tableName, pk)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			writeError(w, http.StatusNotFound, "row not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, row)
}

func (h *Handler) CreateTableRow(w http.ResponseWriter, r *http.Request) {
	tableName := chi.URLParam(r, "table")
	if tableName == "" {
		writeError(w, http.StatusBadRequest, "table is required")
		return
	}

	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	row, err := h.svc.CreateRow(r.Context(), tableName, body)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			writeError(w, http.StatusNotFound, "table not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, row)
}

func (h *Handler) UpdateTableRow(w http.ResponseWriter, r *http.Request) {
	tableName := chi.URLParam(r, "table")
	if tableName == "" {
		writeError(w, http.StatusBadRequest, "table is required")
		return
	}

	tbl := schema.ByName(tableName)
	if tbl == nil {
		writeError(w, http.StatusNotFound, "table not found")
		return
	}

	pk := make(map[string]string, len(tbl.PrimaryKey))
	for _, col := range tbl.PrimaryKey {
		val := r.URL.Query().Get(col)
		if val == "" {
			writeValidationError(w, map[string]string{col: "required"})
			return
		}
		pk[col] = val
	}

	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	row, err := h.svc.UpdateRow(r.Context(), tableName, pk, body)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			writeError(w, http.StatusNotFound, "row not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, row)
}

func (h *Handler) DeleteTableRow(w http.ResponseWriter, r *http.Request) {
	tableName := chi.URLParam(r, "table")
	if tableName == "" {
		writeError(w, http.StatusBadRequest, "table is required")
		return
	}

	tbl := schema.ByName(tableName)
	if tbl == nil {
		writeError(w, http.StatusNotFound, "table not found")
		return
	}

	pk := make(map[string]string, len(tbl.PrimaryKey))
	for _, col := range tbl.PrimaryKey {
		val := r.URL.Query().Get(col)
		if val == "" {
			writeValidationError(w, map[string]string{col: "required"})
			return
		}
		pk[col] = val
	}

	if err := h.svc.DeleteRow(r.Context(), tableName, pk); err != nil {
		if errors.Is(err, service.ErrNotFound) {
			writeError(w, http.StatusNotFound, "row not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
