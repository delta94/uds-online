package services

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
	"log"
	"os"
	"strconv"
	"time"
	"uds-online/api/middleware"
	m "uds-online/api/models"
	u "uds-online/api/utils"
)

type accountService struct {
	TableName string
}

const TypeConfirmation = 1
const TypeReset = 2

/**
Create an entry in DB
*/
func (s *accountService) Create(model *m.Account) error {
	if err := model.Validate(); err != nil {
		return err
	}
	hashedPassword, _ := bcrypt.GenerateFromPassword(
		[]byte(model.Password.Raw), bcrypt.DefaultCost,
	)
	model.Password.Hash = string(hashedPassword)
	model.ConfirmationToken = m.Token{
		Type:      TypeConfirmation,
		ExpiresAt: time.Now().Add(time.Hour * time.Duration(24)),
		Value:     u.TokenGenerator(32),
	}
	if err := m.GetDB().Create(model).Error; err != nil {
		return err
	}
	if model.Email == "" {
		return fmt.Errorf("failed to create account, connection error")
	}
	return nil
}

/**
Search for a specific entry
*/
func (s *accountService) Get(id uint) *m.Account {
	o := &m.Account{}
	err := m.GetDB().Take(o, "id = ?", id).Error
	if err != nil {
		return nil
	}
	return o
}

/**
Fetch multiple entries
*/
func (s *accountService) Find(offset int, limit int) (data []*m.Account, total uint) {
	objs := make([]*m.Account, 0)
	query := m.GetDB().
		Order("created_at desc").
		Table(s.TableName).
		Count(&total).
		Limit(limit).
		Offset(offset * limit).
		Find(&objs)
	if query.Error != nil && !query.RecordNotFound() {
		return nil, 0
	}
	return objs, total
}

/**
Update a specific entry
*/
func (s *accountService) Update(id uint, model *m.Account, issuerId string) (o *m.Account, errResp u.ErrorData) {
	o = &m.Account{}
	err := m.GetDB().Take(o, "id = ?", id).Error
	if err != nil {
		errResp.Code = u.ErrGeneral
		errResp.Error = fmt.Errorf("an error occurred")
		return
	}
	if issuerId != o.ID.String() && o.Role != middleware.RoleAdmin {
		errResp.Code = u.ErrForbidden
		errResp.Error = fmt.Errorf("unable to update not own account")
		return
	}
	//o.Title = model.Title
	//o.Description = model.Description
	//o.ReleaseDate = model.ReleaseDate
	//o.Length = model.Length
	//o.ImdbLink = model.ImdbLink
	o.UpdatedAt = time.Now()
	m.GetDB().Save(o)
	return
}

/**
Delete a specific entry
*/
func (s *accountService) Delete(id uint, soft bool) error {
	o := &m.Account{}
	err := m.GetDB().Table(s.TableName).Where("id = ?", id).First(o).Error
	if err != nil {
		return err
	}
	if soft {
		m.GetDB().Delete(o)
	} else {
		m.GetDB().Unscoped().Delete(o)
	}
	return nil
}

func Login(email, pwd string) (token string, errResp u.ErrorData) {
	account := &m.Account{}
	password := &m.Password{}
	// Find Account by Email
	err := m.GetDB().Table("accounts").Take(account, "email = ?", email).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			errResp.Error = fmt.Errorf("incorrect email/password")
			errResp.Code = u.ErrAuthUserNotFound
			return
		}
		errResp.Error = fmt.Errorf("connection error. Please retry")
		errResp.Code = u.ErrDBConnection
		return
	}
	// Find related password
	m.GetDB().Model(&account).Related(password)
	// Compare hash and password
	err = bcrypt.CompareHashAndPassword([]byte(password.Hash), []byte(pwd))
	if err != nil && (err == bcrypt.ErrMismatchedHashAndPassword || err == bcrypt.ErrHashTooShort) {
		log.Println("Passwords do not match")
		errResp.Error = fmt.Errorf("incorrect email/password")
		errResp.Code = u.ErrAuthUserNotFound
		return
	}
	if account.IsBlocked {
		errResp.Error = fmt.Errorf("your account was blocked")
		errResp.Code = u.ErrAccBlocked
		return
	}
	if !account.IsConfirmed {
		errResp.Error = fmt.Errorf("you have not confirmed your email")
		errResp.Code = u.ErrMailNotConfirmed
		return
	}
	// Create JWT
	expiresInHours, err := strconv.Atoi(os.Getenv("JWT_EXPIRATION_TIME"))
	if err != nil {
		dv := 1
		log.Printf("Warning! JWT's value 'expiresInHours' for 'exp' not found! Using default value (%v)", dv)
		expiresInHours = dv
	}
	tk := &m.JWTToken{}
	tk.IssuedAt = time.Now().Unix()
	tk.ExpiresAt = time.Now().Add(time.Hour * time.Duration(expiresInHours)).Unix()
	tk.Issuer = account.ID.String()
	tk.Role = account.Role
	// Sign JWT With Credentials
	jwtWC := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), tk)
	token, _ = jwtWC.SignedString([]byte(os.Getenv("SECRET")))
	return
}

var AccountService = accountService{TableName: "accounts"}
