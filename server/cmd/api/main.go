package main

import (
	"fmt"
	"net/http"

	"lw-1/server/internal/app"
	"lw-1/server/internal/config"
	"lw-1/server/internal/db"
	"lw-1/server/internal/handler"
	"lw-1/server/internal/repository"
	"lw-1/server/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	gormDB, err := db.Connect(cfg.DSN())
	if err != nil {
		panic(err)
	}

	repo := repository.New(gormDB)
	svc := service.New(repo)
	h := handler.New(svc)

	router := app.NewRouter(cfg, h)

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	if err := http.ListenAndServe(addr, router); err != nil {
		panic(err)
	}
}
