package repository

import (
	"context"
	"fmt"
	"strings"

	"lw-1/server/internal/schema"
)

type RowsPage struct {
	Rows   []map[string]any `json:"rows"`
	Total  int64            `json:"total"`
	Limit  int              `json:"limit"`
	Offset int              `json:"offset"`
}

type ListRowsParams struct {
	Limit   int
	Offset  int
	SortBy  string
	SortDir string
}

func (r *Repository) ListTableRows(
	ctx context.Context,
	tableName string,
	params ListRowsParams,
) (*RowsPage, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, fmt.Errorf("unknown table")
	}

	var total int64
	countSQL := fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, tableName)
	if err := r.DB.WithContext(ctx).Raw(countSQL).Scan(&total).Error; err != nil {
		return nil, fmt.Errorf("count rows: %w", err)
	}

	cols := make([]string, len(tbl.Columns))
	for i, c := range tbl.Columns {
		cols[i] = fmt.Sprintf(`"%s"`, c.Name)
	}

	query := fmt.Sprintf(
		`SELECT %s FROM "%s" ORDER BY %s LIMIT ? OFFSET ?`,
		strings.Join(cols, ", "),
		tableName,
		orderByClause(tbl, params.SortBy, params.SortDir),
	)

	rows, err := r.scanMaps(ctx, query, params.Limit, params.Offset)
	if err != nil {
		return nil, err
	}

	return &RowsPage{
		Rows:   rows,
		Total:  total,
		Limit:  params.Limit,
		Offset: params.Offset,
	}, nil
}

func (r *Repository) CreateTableRow(
	ctx context.Context,
	tableName string,
	values map[string]any,
) (map[string]any, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, fmt.Errorf("unknown table")
	}

	cols := make([]string, 0, len(tbl.Columns))
	for _, c := range tbl.Columns {
		if _, ok := values[c.Name]; ok {
			cols = append(cols, c.Name)
		}
	}
	if len(cols) == 0 {
		return nil, fmt.Errorf("no insertable values")
	}

	qCols := make([]string, len(cols))
	args := make([]any, len(cols))
	holders := make([]string, len(cols))
	for i, col := range cols {
		qCols[i] = fmt.Sprintf(`"%s"`, col)
		args[i] = values[col]
		holders[i] = "?"
	}

	selectCols := make([]string, len(tbl.Columns))
	for i, c := range tbl.Columns {
		selectCols[i] = fmt.Sprintf(`"%s"`, c.Name)
	}

	query := fmt.Sprintf(
		`INSERT INTO "%s" (%s) VALUES (%s) RETURNING %s`,
		tableName,
		strings.Join(qCols, ", "),
		strings.Join(holders, ", "),
		strings.Join(selectCols, ", "),
	)
	rows, err := r.scanMaps(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("insert failed")
	}
	return rows[0], nil
}

func (r *Repository) GetTableRow(
	ctx context.Context,
	tableName string,
	pk map[string]string,
) (map[string]any, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, fmt.Errorf("unknown table")
	}

	if err := validatePK(tbl, pk); err != nil {
		return nil, err
	}

	cols := make([]string, len(tbl.Columns))
	for i, c := range tbl.Columns {
		cols[i] = fmt.Sprintf(`"%s"`, c.Name)
	}

	where, args := buildWhere(tbl.PrimaryKey, pk)
	query := fmt.Sprintf(
		`SELECT %s FROM "%s" WHERE %s LIMIT 1`,
		strings.Join(cols, ", "),
		tableName,
		where,
	)

	rows, err := r.scanMaps(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("row not found")
	}
	return rows[0], nil
}

func (r *Repository) UpdateTableRow(
	ctx context.Context,
	tableName string,
	pk map[string]string,
	updates map[string]any,
) (map[string]any, error) {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return nil, fmt.Errorf("unknown table")
	}
	if err := validatePK(tbl, pk); err != nil {
		return nil, err
	}

	cols := make([]string, 0, len(updates))
	for _, c := range tbl.Columns {
		if _, ok := updates[c.Name]; ok {
			cols = append(cols, c.Name)
		}
	}
	if len(cols) == 0 {
		return nil, fmt.Errorf("no updatable values")
	}

	setParts := make([]string, len(cols))
	args := make([]any, 0, len(cols)+len(tbl.PrimaryKey))
	for i, col := range cols {
		setParts[i] = fmt.Sprintf(`"%s" = ?`, col)
		args = append(args, updates[col])
	}

	where, pkArgs := buildWhere(tbl.PrimaryKey, pk)
	args = append(args, pkArgs...)

	selectCols := make([]string, len(tbl.Columns))
	for i, c := range tbl.Columns {
		selectCols[i] = fmt.Sprintf(`"%s"`, c.Name)
	}

	query := fmt.Sprintf(
		`UPDATE "%s" SET %s WHERE %s RETURNING %s`,
		tableName,
		strings.Join(setParts, ", "),
		where,
		strings.Join(selectCols, ", "),
	)
	rows, err := r.scanMaps(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("row not found")
	}
	return rows[0], nil
}

func (r *Repository) DeleteTableRow(
	ctx context.Context,
	tableName string,
	pk map[string]string,
) error {
	tbl := schema.ByName(tableName)
	if tbl == nil {
		return fmt.Errorf("unknown table")
	}
	if err := validatePK(tbl, pk); err != nil {
		return err
	}
	where, args := buildWhere(tbl.PrimaryKey, pk)
	query := fmt.Sprintf(`DELETE FROM "%s" WHERE %s`, tableName, where)
	res := r.DB.WithContext(ctx).Exec(query, args...)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return fmt.Errorf("row not found")
	}
	return nil
}

func (r *Repository) scanMaps(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	rows, err := r.DB.WithContext(ctx).Raw(query, args...).Rows()
	if err != nil {
		return nil, fmt.Errorf("query: %w", err)
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("columns: %w", err)
	}

	result := make([]map[string]any, 0)
	for rows.Next() {
		values := make([]any, len(columns))
		ptrs := make([]any, len(columns))
		for i := range values {
			ptrs[i] = &values[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return nil, fmt.Errorf("scan: %w", err)
		}
		row := make(map[string]any, len(columns))
		for i, col := range columns {
			row[col] = normalizeValue(values[i])
		}
		result = append(result, row)
	}
	return result, rows.Err()
}

func orderByClause(tbl *schema.Table, sortBy, sortDir string) string {
	if sortBy != "" {
		for _, c := range tbl.Columns {
			if c.Name == sortBy {
				dir := "ASC"
				if strings.EqualFold(sortDir, "desc") {
					dir = "DESC"
				}
				nulls := "NULLS LAST"
				if dir == "DESC" {
					nulls = "NULLS FIRST"
				}
				return fmt.Sprintf(`"%s" %s %s`, sortBy, dir, nulls)
			}
		}
	}

	parts := make([]string, len(tbl.PrimaryKey))
	for i, pkCol := range tbl.PrimaryKey {
		parts[i] = fmt.Sprintf(`"%s"`, pkCol)
	}
	return strings.Join(parts, ", ")
}

func buildWhere(pkCols []string, pk map[string]string) (string, []any) {
	parts := make([]string, len(pkCols))
	args := make([]any, len(pkCols))
	for i, col := range pkCols {
		parts[i] = fmt.Sprintf(`"%s" = ?`, col)
		args[i] = pk[col]
	}
	return strings.Join(parts, " AND "), args
}

func validatePK(tbl *schema.Table, pk map[string]string) error {
	for _, col := range tbl.PrimaryKey {
		if _, ok := pk[col]; !ok || pk[col] == "" {
			return fmt.Errorf("missing primary key column: %s", col)
		}
	}
	return nil
}

func normalizeValue(v any) any {
	if b, ok := v.([]byte); ok {
		return string(b)
	}
	return v
}
