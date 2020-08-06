package models

import (
	"fmt"
	uuid "github.com/google/uuid"
	"time"
)

type Purchase struct {
	ID        uuid.UUID `gorm:"primary_key;type:char(36);"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`
	Sum       int        `json:"sum"`
	Order     int        `json:"order"`
	CourseID  uint       `json:"course_id"`
	AccountID uuid.UUID  `json:"account_id" gorm:"type:char(36);"`
}

func (p *Purchase) Validate() error {
	if p.AccountID.String() == "00000000-0000-0000-0000-000000000000" {
		return fmt.Errorf("user id is not defined")
	}
	return nil
}

func (p *Purchase) BeforeCreate() (err error) {
	id, _ := uuid.NewRandom()
	p.ID = id
	return
}
