package service

import (
	"context"
	"errors"
	"strings"

	"lw-1/server/internal/repository"
	"lw-1/server/internal/schema"
)

var ErrNotFound = errors.New("not found")

func (s *Service) GetSchema() schema.SchemaResponse {
	return schema.SchemaResponse{Tables: schema.Tables()}
}

func (s *Service) ListRows(
	ctx context.Context,
	tableName string,
	limit, offset int,
	sortBy, sortDir string,
) (*repository.RowsPage, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, ErrNotFound
	}
	if limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500
	}
	if offset < 0 {
		offset = 0
	}
	if sortBy != "" {
		allowed := false
		for _, c := range tbl.Columns {
			if c.Name == "password_hash" {
				continue
			}
			if c.Name == sortBy {
				allowed = true
				break
			}
		}
		if !allowed {
			sortBy = ""
		}
	}
	sortDir = strings.ToLower(sortDir)
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "asc"
	}
	return s.repo.ListTableRows(ctx, tableName, repository.ListRowsParams{
		Limit:   limit,
		Offset:  offset,
		SortBy:  sortBy,
		SortDir: sortDir,
	})
}

func (s *Service) GetRow(
	ctx context.Context,
	tableName string,
	pk map[string]string,
) (map[string]any, error) {
	if schema.ByName(tableName) == nil {
		return nil, ErrNotFound
	}
	row, err := s.repo.GetTableRow(ctx, tableName, pk)
	if err != nil {
		if err.Error() == "row not found" {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return row, nil
}

func (s *Service) CreateRow(
	ctx context.Context,
	tableName string,
	values map[string]any,
) (map[string]any, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, ErrNotFound
	}

	insertable := make(map[string]any)
	for _, c := range tbl.Columns {
		if c.IsPrimary {
			continue
		}
		if v, ok := values[c.Name]; ok {
			insertable[c.Name] = v
		}
	}

	return s.repo.CreateTableRow(ctx, tableName, insertable)
}

func (s *Service) UpdateRow(
	ctx context.Context,
	tableName string,
	pk map[string]string,
	values map[string]any,
) (map[string]any, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, ErrNotFound
	}

	updatable := make(map[string]any)
	for _, c := range tbl.Columns {
		if c.IsPrimary || c.ForeignKey != nil {
			continue
		}
		if v, ok := values[c.Name]; ok {
			updatable[c.Name] = v
		}
	}

	row, err := s.repo.UpdateTableRow(ctx, tableName, pk, updatable)
	if err != nil {
		if err.Error() == "row not found" {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return row, nil
}

func (s *Service) DeleteRow(
	ctx context.Context,
	tableName string,
	pk map[string]string,
) error {
	if schema.ByName(tableName) == nil {
		return ErrNotFound
	}
	if err := s.repo.DeleteTableRow(ctx, tableName, pk); err != nil {
		if err.Error() == "row not found" {
			return ErrNotFound
		}
		return err
	}
	return nil
}
