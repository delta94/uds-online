package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
	"html/template"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"time"
	"uds-online/api/middleware"
	m "uds-online/api/models"
	s "uds-online/api/services"
	u "uds-online/api/utils"
)

var CreateAccount = func(w http.ResponseWriter, r *http.Request) {
	account := &m.Account{}
	err := json.NewDecoder(r.Body).Decode(account)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	account.Role = middleware.RoleUser
	err = s.AccountService.Create(account)
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	tplv := make(map[string]string)
	tplv["link"] = fmt.Sprintf("%s%s?t=%s", os.Getenv("API_HOST"), middleware.Routes["v1"]["confirmEmail"], account.ConfirmationToken.Value)
	tplv["email"] = account.Email
	// Send email
	go SendEmail([]string{account.Email}, "Email confirmation", "info", tplv, "tpl/confirmation_email.html")

	p := make(map[string]interface{})
	p["id"] = account.ID
	p["email"] = account.Email
	u.RespondJson(w, u.Response{Payload: p}, http.StatusCreated)
}

var Authenticate = func(roles []int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		account := &m.Account{}
		err1 := json.NewDecoder(r.Body).Decode(account)
		if err1 != nil {
			u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
			return
		}
		token, err2 := s.Login(account.Email, account.Password.Raw, roles)
		if err2.Error != nil {
			u.RespondJson(w, u.Response{Message: err2.Error.Error(), ErrorCode: err2.Code}, http.StatusOK)
			return
		}
		u.RespondJson(w, u.Response{Payload: map[string]string{"token": token}}, http.StatusOK)
	}
}

var GetAccount = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	account := s.AccountService.Get(uint(id))
	if account == nil {
		u.RespondJson(w, u.Response{Message: "Not found"}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: account}, http.StatusOK)
}

var GetAccounts = func(w http.ResponseWriter, r *http.Request) {
	offset, err1 := strconv.Atoi(r.URL.Query().Get("p"))
	limit, err2 := strconv.Atoi(r.URL.Query().Get("s"))
	role, err3 := strconv.Atoi(r.URL.Query().Get("r"))
	if err1 != nil {
		offset = 0
	}
	if err2 != nil {
		limit = 10
	}
	if err3 != nil {
		role = middleware.RoleUser
	}
	if limit == 0 || limit > 50 {
		limit = 10
	}
	if role != middleware.RoleUser && role != middleware.RoleAssistant {
		role = middleware.RoleUser
	}
	accounts, total := s.AccountService.Find(offset, limit, role)
	if accounts == nil {
		log.Printf("Error! Cound not fetch accounts")
		u.RespondJson(w, u.Response{Message: "An Error occurred", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.PaginatedResponse{Payload: u.PaginatedResponsePayload{Size: limit, Page: offset, Total: total, Data: accounts}}, http.StatusOK)
}

var GetAssistants = func(w http.ResponseWriter, r *http.Request) {
	accounts, err := s.AccountService.GetAssistants()
	if err != nil {
		log.Printf("Error! Cound not fetch assistants")
		u.RespondJson(w, u.Response{Message: "An Error occurred", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: accounts}, http.StatusOK)
}


var UpdateAccount = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err1 := strconv.Atoi(params["id"])
	if err1 != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	account := &m.Account{}
	err2 := json.NewDecoder(r.Body).Decode(account)
	if err2 != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	ctx := r.Context().Value("0").(u.ContextPayload)
	issuerId := ctx.Get("user")
	if issuerId == "" {
		log.Println("Error! Secure route has no user stored in context")
	}
	updated, err3 := s.AccountService.Update(uint(id), account, issuerId)
	if err3.Error != nil {
		log.Printf(err3.Error.Error())
		u.RespondJson(w, u.Response{Message: err3.Error.Error(), ErrorCode: err3.Code}, http.StatusOK)
		return
	}
	u.RespondJson(w, updated, http.StatusOK)
}

var DeleteAccount = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err1 := strconv.Atoi(params["id"])
	if err1 != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	err2 := s.AccountService.Delete(uint(id), false)
	if err2 == gorm.ErrRecordNotFound {
		u.RespondJson(w, u.Response{Message: "Not Found"}, http.StatusOK)
		return
	}
	if err2 != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	u.RespondJson(w, nil, http.StatusNoContent)
}

var ManualEmailConfirm = func(w http.ResponseWriter, r *http.Request) {
	type Body struct {ID string `json:"id"`}
	body := &Body{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil || body.ID == "" {
		u.RespondJson(w, u.Response{Message: "Invalid UUID", ErrorCode: u.ErrNotFound}, http.StatusOK)
		return
	}
	query := m.GetDB().Table(s.AccountService.TableName).
		Where("id = ?", body.ID).
		Update(map[string]interface{}{"is_confirmed": 1})
	err = query.Error
	if err != nil || query.RowsAffected == 0 {
		u.RespondJson(w, u.Response{Message: "Could not confirm Email", ErrorCode: u.ErrNotFound}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Message: "Email successfully confirmed"}, http.StatusOK)
}
var ChangeAccountBlockState = func(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		ID      string `json:"id"`
		Blocked bool   `json:"blocked"`
	}
	body := &Body{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil || body.ID == "" {
		u.RespondJson(w, u.Response{Message: "Invalid UUID", ErrorCode: u.ErrNotFound}, http.StatusOK)
		return
	}
	query := m.GetDB().Table(s.AccountService.TableName).
		Where("id = ?", body.ID).
		Update(map[string]interface{}{"is_blocked": body.Blocked})
	err = query.Error
	if err != nil || query.RowsAffected == 0 {
		u.RespondJson(w, u.Response{Message: "Could not update user", ErrorCode: u.ErrNotFound}, http.StatusOK)
		return
	}
	message := "User successfully blocked"
	if !body.Blocked {
		message = "User successfully unblocked"
	}
	u.RespondJson(w, u.Response{Message: message}, http.StatusOK)
}

var ConfirmEmail = func(w http.ResponseWriter, r *http.Request) {
	tplSuccess := template.Must(template.ParseFiles("tpl/confirmation_success.html"))
	tplFail := template.Must(template.ParseFiles("tpl/confirmation_fail.html"))
	type Values struct {
		Title string
		Text  string
	}
	t := r.URL.Query().Get("t")
	v := &Values{}
	v.Title = "Confirmation failed"
	v.Text = "This token expired or has already been used."
	if t == "" {
		tplFail.Execute(w, v)
		return
	}
	err := RedeemConfirmation(t)
	if err != nil {
		log.Println(err)
		tplFail.Execute(w, v)
		return
	}
	v.Title = "Confirmation successful"
	v.Text = "You've successfully confirmed your email. This page can now be closed."
	tplSuccess.Execute(w, v)
}

var IssuePasswordReset = func(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		Email string `json:"email"`
	}
	body := &Body{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "An error occurred"}, http.StatusOK)
		return
	}
	account := &m.Account{}
	err = m.GetDB().Preload("ResetToken", "type = ?", s.TypeReset).Take(account, "email = ?", body.Email).Error
	if err != nil { // Ignore error and respond with success to avoid sniffing
		log.Printf("An attempt to reset password for not existing account [%s]\n", account.Email)
		u.RespondJson(w, u.Response{Message: "OK! Please check your your email!"}, http.StatusOK)
	}
	account.ResetToken.Value = u.TokenGenerator(32)
	account.ResetToken.ExpiresAt = time.Now().Add(time.Hour * time.Duration(24))
	account.ResetToken.Type = s.TypeReset
	account.ResetToken.Expired = false
	err = m.GetDB().Save(account).Error
	if err != nil { // Ignore error and respond with success to avoid sniffing
		log.Printf("Cannot set new reset password")
	}

	tplv := make(map[string]string)
	tplv["link"] = fmt.Sprintf("%s/reset?t=%s", os.Getenv("FRONTEND_HOST"), account.ResetToken.Value)
	tplv["email"] = account.Email
	go SendEmail([]string{account.Email}, "Password reset", "info", tplv, "tpl/reset_email.html")

	u.RespondJson(w, u.Response{Message: "OK! Please check your your email!"}, http.StatusOK)
}

var ResetPassword = func(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		Password     string `json:"password"`
		Confirmation string `json:"confirmation"`
		Token        string `json:"token"`
	}
	body := &Body{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "An error occurred"}, http.StatusOK)
		return
	}
	if len(body.Password) < 6 {
		u.RespondJson(w, u.Response{Message: "Password is too short"}, http.StatusOK)
		return
	}
	if body.Password != body.Confirmation {
		u.RespondJson(w, u.Response{Message: "Passwords do not match"}, http.StatusOK)
		return
	}
	err = RedeemReset(body.Token, body.Password)
	if err != nil {
		log.Println(err)
		u.RespondJson(w, u.Response{Message: "This token expired or has already been used."}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Message: "Password has been updated"}, http.StatusOK)
}

func RedeemConfirmation(token string) error {
	tx := m.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return err
	}
	t := &m.Token{}
	if err := tx.Preload("Account").Find(t, "value = ? AND expired = ? AND expires_at > ?", token, 0, time.Now()).Error; err != nil {
		tx.Rollback()
		return err
	}
	// Check if account's already been confirmed or whether the token found expired
	if t.Account.IsConfirmed || t.Value == "" {
		return fmt.Errorf("account already confirmed")
	}
	t.Expired = true
	t.Account.IsConfirmed = true
	if err := tx.Save(t).Error; err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func RedeemReset(token string, password string) error {
	tx := m.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return err
	}
	t := &m.Token{}
	if err := tx.Preload("Account.Password").Find(t, "value = ? AND expired = ? AND expires_at > ?", token, 0, time.Now()).Error; err != nil {
		tx.Rollback()
		return err
	}
	if t.Value == "" { // Token not found
		return fmt.Errorf("reset token not found")
	}
	hash, _ := bcrypt.GenerateFromPassword(
		[]byte(password), bcrypt.DefaultCost,
	)
	t.Account.Password.Hash = string(hash)
	t.Expired = true
	if err := tx.Save(t).Error; err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func SendEmail(to []string, subject string, from string, data interface{}, tplPath string) {
	t, err := template.ParseFiles(tplPath)
	if err != nil {
		log.Println("Could load template", err.Error())
		return
	}
	var buffer bytes.Buffer
	if err := t.Execute(&buffer, data); err != nil {
		log.Println("Could execute template", err.Error())
		return
	}
	auth := smtp.PlainAuth(
		"",
		os.Getenv("SMTP_USER"),
		os.Getenv("SMTP_PASSWORD"),
		os.Getenv("SMTP_HOST"),
	)
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	subject = "Subject: " + subject + "\n"
	msg := []byte(subject + mime + "\n" + buffer.String())
	log.Printf("Trying to send email to %s\n", strings.Join(to, ","))
	err = smtp.SendMail(
		fmt.Sprintf("%s:%s", os.Getenv("SMTP_HOST"), os.Getenv("SMTP_PORT")),
		auth,
		fmt.Sprintf("%s@%s", from, os.Getenv("SMTP_SENDER_DOMAIN")),
		to,
		msg,
	)
	if err != nil {
		log.Println("Cannot send email", err)
	} else {
		log.Printf("Mail to %s has been sent successfully", strings.Join(to, ","))
	}
}
