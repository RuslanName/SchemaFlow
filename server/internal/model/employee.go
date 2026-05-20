package model

import "time"

type Employee struct {
	ID             uint      `gorm:"primaryKey"`
	IndividualID   uint      `gorm:"column:individual_id;not null;uniqueIndex"`
	ContractNumber string    `gorm:"column:contract_number;not null"`
	Position       string    `gorm:"column:position;not null"`
	HireDate       time.Time `gorm:"column:hire_date;type:date;not null"`

	Individual Individual `gorm:"foreignKey:IndividualID"`
	Contracts  []Contract `gorm:"foreignKey:EmployeeID"`
}

func (Employee) TableName() string {
	return "employees"
}
