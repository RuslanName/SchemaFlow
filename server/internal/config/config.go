package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	CORSOrigins []string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		ServerPort: envOrDefault("SERVER_PORT", "8080"),
		DBHost:     envOrDefault("DATABASE_HOST", "localhost"),
		DBPort:     envOrDefault("DATABASE_PORT", "5432"),
		DBUser:     envOrDefault("DATABASE_USER", "postgres"),
		DBPassword: os.Getenv("DATABASE_PASSWORD"),
		DBName:     envOrDefault("DATABASE_NAME", "lw1"),
		CORSOrigins: parseOrigins(envOrDefault(
			"CORS_ORIGINS",
			"http://localhost:5173",
		)),
	}

	if cfg.DBPassword == "" {
		return nil, fmt.Errorf("DATABASE_PASSWORD is required")
	}

	return cfg, nil
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		c.DBHost, c.DBUser, c.DBPassword, c.DBName, c.DBPort,
	)
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseOrigins(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		if origin := strings.TrimSpace(part); origin != "" {
			origins = append(origins, origin)
		}
	}
	return origins
}
