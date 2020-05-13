package models

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
	"regexp"
	"strings"
	"time"
)

type JWTToken struct {
	jwt.StandardClaims
}

type Account struct {
	ID                uuid.UUID `gorm:"primary_key;type:char(36);"`
	Email             string    `gorm:"size:80;unique_index;not null" json:"email"`
	IsConfirmed       bool      `json:"confirmed"`
	ConfirmationToken Token     `gorm:"foreignkey:AccountID"`
	ResetToken        Token     `gorm:"foreignkey:AccountID"`
	Password          Password  `json:"password" gorm:"foreignkey:AccountID"`
	Role              int       `json:"role"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         *time.Time `sql:"index"`
	IsBlocked         bool       `json:"is_blocked"`
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
	id, err := uuid.NewV4()
	account.ID = id
	return
}

func (account *Account) Validate() error {
	if !strings.Contains(account.Email, "@") {
		return fmt.Errorf("email address is required")
	}

	re := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	if !re.MatchString(account.Email) {
		return fmt.Errorf("invalid email")
	}

	if account.Password.Raw == "" {
		return fmt.Errorf("password is required")
	}

	if len(account.Password.Raw) < 6 {
		return fmt.Errorf("password is too short")
	}

	if account.Password.Raw != account.Password.Confirmation {
		return fmt.Errorf("passwords do not match")
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
