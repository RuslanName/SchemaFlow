package handler

import (
	"fmt"
	"net/http"
	"os"
)

func (h *Handler) Root(w http.ResponseWriter, r *http.Request) {
	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:5173"
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = fmt.Fprintf(w, `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>LW-5 API</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.5; }
    a { color: #4338ca; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Это API-сервер</h1>
  <p>Интерфейс обозревателя БД — на клиенте Vite, не здесь.</p>
  <p><a href="%s">Открыть клиент → %s</a></p>
  <p>Проверка API: <code>GET /api/health</code>, <code>GET /api/schema/tables</code></p>
  <p>Запуск клиента из папки <code>client</code>: <code>npm run dev</code></p>
</body>
</html>`, clientURL, clientURL)
}
