package model

type ContractAddress struct {
	ID        uint    `gorm:"primaryKey"`
	Region    string  `gorm:"column:region;not null"`
	City      string  `gorm:"column:city;not null"`
	Street    string  `gorm:"column:street;not null"`
	Building  string  `gorm:"column:building;not null"`
	Apartment *string `gorm:"column:apartment"`

	Contracts []Contract `gorm:"foreignKey:AddressID"`
}

func (ContractAddress) TableName() string {
	return "contract_addresses"
}
