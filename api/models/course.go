package models

import "github.com/jinzhu/gorm"

type Course struct {
	gorm.Model
	Title      string         `json:"title" gorm:"size:120;unique_index;not null"`
	Annotation string         `json:"annotation" gorm:"size:400"`
	Paid       bool           `json:"paid"`
	Content    *CourseContent `json:"content" gorm:"foreignkey:CourseID"`
}

type CourseContent struct {
	gorm.Model
	Body     string        `json:"content" gorm:"size:16000"`
	Tasks    []*CourseTask `json:"tasks" gorm:"foreignkey:CourseContentID"`
	CourseID uint          `json:"-"`
}
