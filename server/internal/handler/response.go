package handler

import (
	"encoding/json"
	"net/http"
)

type errorBody struct {
	Error   string            `json:"error,omitempty"`
	Details map[string]string `json:"details,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorBody{Error: message})
}

func writeValidationError(w http.ResponseWriter, details map[string]string) {
	writeJSON(w, http.StatusBadRequest, errorBody{
		Error:   "validation failed",
		Details: details,
	})
}
