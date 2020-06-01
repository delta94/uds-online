package models

import "github.com/jinzhu/gorm"

type LessonTask struct {
	gorm.Model
	Type            int    `json:"type"`
	Data            string `json:"data" gorm:""`
	LessonContentID uint   `json:"-"`
}
