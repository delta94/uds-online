package models

import "github.com/jinzhu/gorm"

type CourseTask struct {
	gorm.Model
	Type            int    `json:"type"`
	Data            string `json:"data" gorm:""`
	CourseContentID uint   `json:"-"`
}
