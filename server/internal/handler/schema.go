package handler

import "net/http"

func (h *Handler) GetSchema(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.GetSchema())
}
