package models

import (
	"fmt"
	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
	"unicode/utf8"
)

type Course struct {
	gorm.Model
	Title       string    `json:"title" gorm:"size:120;unique_index;not null"`
	Annotation  string    `json:"annotation" gorm:"size:1000"`
	Price       int       `json:"price"`
	Lessons     []*Lesson `gorm:"foreignkey:CourseID"`
	AssistantID uuid.UUID `json:"assistant_id" gorm:"index;type:char(36);"`
	Published   bool      `json:"published"`
}

type Lesson struct {
	gorm.Model
	Title      string         `json:"title" gorm:"size:120;unique_index;not null"`
	Annotation string         `json:"annotation" gorm:"size:700"`
	Paid       bool           `json:"paid"`
	Published  bool           `json:"published"`
	Content    *LessonContent `json:"content" gorm:"foreignkey:LessonID"`
	CourseID   uint           `json:"course_id"`
}

type LessonContent struct {
	gorm.Model
	Body     string        `json:"content" gorm:"size:16000"`
	Tasks    []*LessonTask `json:"tasks" gorm:"foreignkey:LessonContentID"`
	LessonID uint          `json:"-"`
}

func (course *Course) Validate() error {
	aLength := utf8.RuneCountInString(course.Annotation)
	tLength := utf8.RuneCountInString(course.Title)
	if tLength < 10 {
		return fmt.Errorf("title is too short (%v)", tLength)
	}
	if tLength > 80 {
		return fmt.Errorf("title is too long (%v)", tLength)
	}
	if aLength < 10 {
		return fmt.Errorf("annotation is too short (%v)", aLength)
	}
	if aLength > 700 {
		return fmt.Errorf("annotation is too long (%v)", aLength)
	}
	if course.Price < 100 {
		return fmt.Errorf("price is too low")
	}
	if course.Price > 9000 {
		return fmt.Errorf("price is too high")
	}
	if course.AssistantID.String() == "00000000-0000-0000-0000-000000000000" {
		return fmt.Errorf("assistant id is not defined")
	}
	return nil
}
