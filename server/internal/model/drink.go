package model

type Drink struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"column:name;not null;uniqueIndex"`

	SupportedDrinks []SupportedDrink `gorm:"foreignKey:DrinkID"`
}

func (Drink) TableName() string {
	return "drinks"
}

type SupportedDrink struct {
	CoffeeMachineID uint `gorm:"column:coffee_machine_id;primaryKey"`
	DrinkID         uint `gorm:"column:drink_id;primaryKey"`

	CoffeeMachine CoffeeMachine `gorm:"foreignKey:CoffeeMachineID"`
	Drink         Drink         `gorm:"foreignKey:DrinkID"`
}

func (SupportedDrink) TableName() string {
	return "supported_drinks"
}
