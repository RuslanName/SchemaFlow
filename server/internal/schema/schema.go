package schema

type Column struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	IsPrimary  bool   `json:"is_primary"`
	ForeignKey *FK    `json:"foreign_key,omitempty"`
}

type FK struct {
	Table  string `json:"table"`
	Column string `json:"column"`
}

type Table struct {
	Name       string   `json:"name"`
	Label      string   `json:"label"`
	Columns    []Column `json:"columns"`
	PrimaryKey []string `json:"primary_key"`
}

type SchemaResponse struct {
	Tables []Table `json:"tables"`
}

func col(name, typ string, pk bool, fk *FK) Column {
	return Column{Name: name, Type: typ, IsPrimary: pk, ForeignKey: fk}
}

func fkRef(table, column string) *FK {
	return &FK{Table: table, Column: column}
}

func Tables() []Table {
	return []Table{
		{
			Name: "individuals", Label: "Физические лица",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("first_name", "text", false, nil),
				col("last_name", "text", false, nil),
				col("middle_name", "text", false, nil),
				col("passport_data", "text", false, nil),
				col("phone_number", "text", false, nil),
			},
		},
		{
			Name: "employees", Label: "Сотрудники",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("individual_id", "integer", false, fkRef("individuals", "id")),
				col("contract_number", "text", false, nil),
				col("position", "text", false, nil),
				col("hire_date", "date", false, nil),
			},
		},
		{
			Name: "clients", Label: "Клиенты",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("individual_id", "integer", false, fkRef("individuals", "id")),
				col("login", "text", false, nil),
				col("password_hash", "text", false, nil),
				col("email", "text", false, nil),
				col("balance", "numeric", false, nil),
			},
		},
		{
			Name: "contract_addresses", Label: "Адреса",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("region", "text", false, nil),
				col("city", "text", false, nil),
				col("street", "text", false, nil),
				col("building", "text", false, nil),
				col("apartment", "text", false, nil),
			},
		},
		{
			Name: "contracts", Label: "Договоры",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("client_id", "integer", false, fkRef("clients", "id")),
				col("address_id", "integer", false, fkRef("contract_addresses", "id")),
				col("employee_id", "integer", false, fkRef("employees", "id")),
				col("monthly_payment_amount", "numeric", false, nil),
				col("file_link", "text", false, nil),
				col("duration", "integer", false, nil),
				col("sign_date", "date", false, nil),
			},
		},
		{
			Name: "payments", Label: "Платежи",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("contract_id", "integer", false, fkRef("contracts", "id")),
				col("date", "date", false, nil),
			},
		},
		{
			Name: "coffee_machine_brands", Label: "Бренды",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("name", "text", false, nil),
			},
		},
		{
			Name: "coffee_machine_types", Label: "Типы кофемашин",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("name", "text", false, nil),
			},
		},
		{
			Name: "coffee_machine_models", Label: "Модели кофемашин",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("brand_id", "integer", false, fkRef("coffee_machine_brands", "id")),
				col("name", "text", false, nil),
			},
		},
		{
			Name: "coffee_machines", Label: "Кофемашины",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("model_id", "integer", false, fkRef("coffee_machine_models", "id")),
				col("brand_id", "integer", false, fkRef("coffee_machine_brands", "id")),
				col("type_id", "integer", false, fkRef("coffee_machine_types", "id")),
				col("pressure", "numeric", false, nil),
				col("power", "numeric", false, nil),
				col("water_tank_volume", "numeric", false, nil),
				col("cups_per_hour", "integer", false, nil),
				col("bean_container_volume", "numeric", false, nil),
				col("chip_number", "text", false, nil),
				col("width", "numeric", false, nil),
				col("height", "numeric", false, nil),
				col("depth", "numeric", false, nil),
				col("weight", "numeric", false, nil),
			},
		},
		{
			Name: "coffee_machine_photos", Label: "Фото кофемашин",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("coffee_machine_id", "integer", false, fkRef("coffee_machines", "id")),
				col("photo_link", "text", false, nil),
			},
		},
		{
			Name: "coffee_machine_states", Label: "Состояния кофемашин",
			PrimaryKey: []string{"contract_id", "coffee_machine_id", "status_change_date"},
			Columns: []Column{
				col("contract_id", "integer", true, fkRef("contracts", "id")),
				col("coffee_machine_id", "integer", true, fkRef("coffee_machines", "id")),
				col("status_change_date", "timestamp", true, nil),
				col("work_status", "text", false, nil),
			},
		},
		{
			Name: "rental_prices", Label: "Цены аренды",
			PrimaryKey: []string{"coffee_machine_id", "change_date"},
			Columns: []Column{
				col("coffee_machine_id", "integer", true, fkRef("coffee_machines", "id")),
				col("change_date", "date", true, nil),
				col("price", "numeric", false, nil),
			},
		},
		{
			Name: "drinks", Label: "Напитки",
			PrimaryKey: []string{"id"},
			Columns: []Column{
				col("id", "integer", true, nil),
				col("name", "text", false, nil),
			},
		},
		{
			Name: "supported_drinks", Label: "Поддерживаемые напитки",
			PrimaryKey: []string{"coffee_machine_id", "drink_id"},
			Columns: []Column{
				col("coffee_machine_id", "integer", true, fkRef("coffee_machines", "id")),
				col("drink_id", "integer", true, fkRef("drinks", "id")),
			},
		},
	}
}

func ByName(name string) *Table {
	for _, t := range Tables() {
		if t.Name == name {
			copy := t
			return &copy
		}
	}
	return nil
}
