package model

import "time"

type CoffeeMachineBrand struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"column:name;not null;uniqueIndex"`

	Models         []CoffeeMachineModel `gorm:"foreignKey:BrandID"`
	CoffeeMachines []CoffeeMachine      `gorm:"foreignKey:BrandID"`
}

func (CoffeeMachineBrand) TableName() string {
	return "coffee_machine_brands"
}

type CoffeeMachineType struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"column:name;not null;uniqueIndex"`

	CoffeeMachines []CoffeeMachine `gorm:"foreignKey:TypeID"`
}

func (CoffeeMachineType) TableName() string {
	return "coffee_machine_types"
}

type CoffeeMachineModel struct {
	ID      uint   `gorm:"primaryKey"`
	BrandID uint   `gorm:"column:brand_id;not null"`
	Name    string `gorm:"column:name;not null"`

	Brand          CoffeeMachineBrand `gorm:"foreignKey:BrandID"`
	CoffeeMachines []CoffeeMachine    `gorm:"foreignKey:ModelID"`
}

func (CoffeeMachineModel) TableName() string {
	return "coffee_machine_models"
}

type CoffeeMachine struct {
	ID                  uint    `gorm:"primaryKey"`
	ModelID             uint    `gorm:"column:model_id;not null"`
	BrandID             uint    `gorm:"column:brand_id;not null"`
	TypeID              uint    `gorm:"column:type_id;not null"`
	Pressure            float64 `gorm:"column:pressure;not null"`
	Power               float64 `gorm:"column:power;not null"`
	WaterTankVolume     float64 `gorm:"column:water_tank_volume;not null"`
	CupsPerHour         float64 `gorm:"column:cups_per_hour;not null"`
	BeanContainerVolume float64 `gorm:"column:bean_container_volume;not null"`
	ChipNumber          string  `gorm:"column:chip_number;not null"`
	Width               float64 `gorm:"column:width;not null"`
	Height              float64 `gorm:"column:height;not null"`
	Depth               float64 `gorm:"column:depth;not null"`
	Weight              float64 `gorm:"column:weight;not null"`

	Model            CoffeeMachineModel   `gorm:"foreignKey:ModelID"`
	Brand            CoffeeMachineBrand   `gorm:"foreignKey:BrandID"`
	Type             CoffeeMachineType    `gorm:"foreignKey:TypeID"`
	Photos           []CoffeeMachinePhoto `gorm:"foreignKey:CoffeeMachineID"`
	States           []CoffeeMachineState `gorm:"foreignKey:CoffeeMachineID"`
	RentalPrices     []RentalPrice        `gorm:"foreignKey:CoffeeMachineID"`
	SupportedDrinks  []SupportedDrink     `gorm:"foreignKey:CoffeeMachineID"`
}

func (CoffeeMachine) TableName() string {
	return "coffee_machines"
}

type CoffeeMachinePhoto struct {
	ID              uint   `gorm:"primaryKey"`
	CoffeeMachineID uint   `gorm:"column:coffee_machine_id;not null"`
	PhotoLink       string `gorm:"column:photo_link;not null"`

	CoffeeMachine CoffeeMachine `gorm:"foreignKey:CoffeeMachineID"`
}

func (CoffeeMachinePhoto) TableName() string {
	return "coffee_machine_photos"
}

type CoffeeMachineState struct {
	ContractID       uint      `gorm:"column:contract_id;primaryKey"`
	CoffeeMachineID  uint      `gorm:"column:coffee_machine_id;primaryKey"`
	StatusChangeDate time.Time `gorm:"column:status_change_date;type:date;primaryKey"`
	WorkStatus       string    `gorm:"column:work_status;not null"`

	Contract      Contract      `gorm:"foreignKey:ContractID"`
	CoffeeMachine CoffeeMachine `gorm:"foreignKey:CoffeeMachineID"`
}

func (CoffeeMachineState) TableName() string {
	return "coffee_machine_states"
}

type RentalPrice struct {
	CoffeeMachineID uint      `gorm:"column:coffee_machine_id;primaryKey"`
	ChangeDate      time.Time `gorm:"column:change_date;type:date;primaryKey"`
	Price           float64   `gorm:"column:price;not null"`

	CoffeeMachine CoffeeMachine `gorm:"foreignKey:CoffeeMachineID"`
}

func (RentalPrice) TableName() string {
	return "rental_prices"
}
