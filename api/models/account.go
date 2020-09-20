package models

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
	"strings"
	"time"
	u "uds-online/api/utils"
	"unicode/utf8"
)

type JWTToken struct {
	jwt.StandardClaims
	Role int `json:"role"`
}

// Model for Account.
// Roles are integers, 1 - user, 2 - admin, 3 - assistant
type Account struct {
	ID                uuid.UUID `gorm:"primary_key;type:char(36);"`
	Email             string    `gorm:"size:80;unique_index;not null" json:"email"`
	Name              string    `gorm:"size:20" json:"name"`
	IsConfirmed       bool      `json:"confirmed"`
	ConfirmationToken *Token    `gorm:"foreignkey:AccountID" json:"-"`
	ResetToken        *Token    `gorm:"foreignkey:AccountID" json:"-"`
	Password          *Password `json:"password" gorm:"foreignkey:AccountID"`
	Role              int       `json:"role"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         *time.Time      `sql:"index"`
	IsBlocked         bool            `json:"is_blocked"`
	AssignedCourses   []*Course       `json:"assigned_courses" gorm:"foreignkey:AssistantID"`
	Purchases         []*Purchase     `json:"purchases" gorm:"foreignkey:PurchaseID"`
	LessonAnswers     []*LessonAnswer `gorm:"foreignkey:AccountID" json:"-"`
}

type Password struct {
	gorm.Model
	Hash         string    `json:"-" gorm:"size:60"`
	Raw          string    `json:"value" sql:"-"`
	Confirmation string    `json:"confirmation" sql:"-"`
	AccountID    uuid.UUID `gorm:"primary_key;type:char(36);"`
	Account      *Account
}

type Token struct {
	gorm.Model
	Value     string `gorm:"size:64;unique_index;not null"`
	Expired   bool   // when is used
	ExpiresAt time.Time
	Type      int       // 1 - email confirmation; 2 - password reset
	AccountID uuid.UUID `gorm:"type:char(36);"`
	Account   *Account
}

func (account *Account) BeforeCreate() (err error) {
	id, _ := uuid.NewRandom()
	account.ID = id
	return
}

func (account *Account) Validate() error {
	if !strings.Contains(account.Email, "@") {
		return fmt.Errorf("email address is required")
	}

	if !u.ValidateEmail(account.Email) {
		return fmt.Errorf("invalid email")
	}

	if utf8.RuneCountInString(account.Name) > 20 {
		return fmt.Errorf("name is too long")
	}

	if strings.Trim(account.Name, " ") == "" {
		return fmt.Errorf("name is required")
	}
	if account.Password == nil {
		return fmt.Errorf("password is required")
	}
	// Email must be unique
	temp := &Account{}

	//check for errors and duplicate emails
	err := GetDB().Table("accounts").Where("email = ?", account.Email).First(temp).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return fmt.Errorf("connection error. Please retry")
	}
	if temp.Email != "" {
		return fmt.Errorf("email is taken")
	}

	return nil
}

func (password *Password) Validate() error {
	if password.Raw == "" {
		return fmt.Errorf("name is required")
	}

	if utf8.RuneCountInString(password.Raw) < 6 {
		return fmt.Errorf("password is too short")
	}

	if password.Raw != password.Confirmation {
		return fmt.Errorf("passwords do not match")
	}

	return nil
}
