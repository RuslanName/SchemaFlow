package model

import "time"

type Payment struct {
	ID         uint      `gorm:"primaryKey"`
	ContractID uint      `gorm:"column:contract_id;not null"`
	Date       time.Time `gorm:"column:date;type:date;not null"`

	Contract Contract `gorm:"foreignKey:ContractID"`
}

func (Payment) TableName() string {
	return "payments"
}
