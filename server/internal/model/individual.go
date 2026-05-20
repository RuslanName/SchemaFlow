package model

type Individual struct {
	ID           uint    `gorm:"primaryKey"`
	FirstName    string  `gorm:"column:first_name;not null"`
	LastName     string  `gorm:"column:last_name;not null"`
	MiddleName   *string `gorm:"column:middle_name"`
	PassportData string  `gorm:"column:passport_data;not null"`
	PhoneNumber  string  `gorm:"column:phone_number;not null"`

	Client   *Client   `gorm:"foreignKey:IndividualID"`
	Employee *Employee `gorm:"foreignKey:IndividualID"`
}

func (Individual) TableName() string {
	return "individuals"
}
