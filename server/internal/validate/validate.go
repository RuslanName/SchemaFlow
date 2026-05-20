package validate

import (
	"errors"
	"strings"

	"github.com/go-playground/validator/v10"
)

var v = validator.New()

func Struct(s any) error {
	return v.Struct(s)
}

func Format(err error) map[string]string {
	var validationErrs validator.ValidationErrors
	if !errors.As(err, &validationErrs) {
		return map[string]string{"_": err.Error()}
	}

	out := make(map[string]string, len(validationErrs))
	for _, fieldErr := range validationErrs {
		out[strings.ToLower(fieldErr.Field())] = fieldErr.Tag()
	}
	return out
}
