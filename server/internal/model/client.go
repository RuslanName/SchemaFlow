package model

type Client struct {
	ID           uint    `gorm:"primaryKey"`
	IndividualID uint    `gorm:"column:individual_id;not null;uniqueIndex"`
	Login        string  `gorm:"column:login;not null;uniqueIndex"`
	PasswordHash string  `gorm:"column:password_hash;not null"`
	Email        string  `gorm:"column:email;not null"`
	Balance      float64 `gorm:"column:balance;not null"`

	Individual Individual `gorm:"foreignKey:IndividualID"`
	Contracts  []Contract `gorm:"foreignKey:ClientID"`
}

func (Client) TableName() string {
	return "clients"
}
