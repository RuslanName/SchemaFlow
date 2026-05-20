package model

import "time"

type Contract struct {
	ID                   uint      `gorm:"primaryKey"`
	ClientID             uint      `gorm:"column:client_id;not null"`
	AddressID            uint      `gorm:"column:address_id;not null"`
	EmployeeID           uint      `gorm:"column:employee_id;not null"`
	MonthlyPaymentAmount float64   `gorm:"column:monthly_payment_amount;not null"`
	FileLink             string    `gorm:"column:file_link;not null"`
	Duration             int       `gorm:"column:duration;not null"`
	SignDate             time.Time `gorm:"column:sign_date;type:date;not null"`

	Client              Client               `gorm:"foreignKey:ClientID"`
	Address             ContractAddress      `gorm:"foreignKey:AddressID"`
	Employee            Employee             `gorm:"foreignKey:EmployeeID"`
	Payments            []Payment            `gorm:"foreignKey:ContractID"`
	CoffeeMachineStates []CoffeeMachineState `gorm:"foreignKey:ContractID"`
}

func (Contract) TableName() string {
	return "contracts"
}
