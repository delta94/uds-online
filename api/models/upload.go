package models

import (
	"github.com/jinzhu/gorm"
	utl "uds-online/api/utils"
)

type Upload struct {
	gorm.Model
	Alias        string `json:"alias" gorm:"size:12;unique_index;"`
	OriginalName string `json:"original_name" gorm:"size:80;"`
	Type         string `json:"type" gorm:"size:32"`
	Comment      string `json:"comment" gorm:"size:80;"`
	Path         string `json:"path"`
}

func (upload *Upload) BeforeCreate() (err error) {
	upload.Alias = utl.TokenGenerator(6)
	return nil
}
