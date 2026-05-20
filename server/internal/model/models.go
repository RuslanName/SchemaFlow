package model

func All() []any {
	return []any{
		&Individual{},
		&Employee{},
		&Client{},
		&ContractAddress{},
		&Contract{},
		&Payment{},
		&CoffeeMachineBrand{},
		&CoffeeMachineType{},
		&CoffeeMachineModel{},
		&CoffeeMachine{},
		&CoffeeMachinePhoto{},
		&CoffeeMachineState{},
		&RentalPrice{},
		&Drink{},
		&SupportedDrink{},
	}
}
