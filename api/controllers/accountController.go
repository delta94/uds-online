package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"github.com/mailgun/mailgun-go/v4"
	"golang.org/x/crypto/bcrypt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
	"uds-online/api/middleware"
	m "uds-online/api/models"
	s "uds-online/api/services"
	u "uds-online/api/utils"
)

type reCHAPTCHAResponse struct {
	Success        bool      `json:"success"`
	ChallengeTS    time.Time `json:"challenge_ts"`
	Hostname       string    `json:"hostname,omitempty"`
	ApkPackageName string    `json:"apk_package_name,omitempty"`
	Action         string    `json:"action,omitempty"`
	Score          float32   `json:"score,omitempty"`
	ErrorCodes     []string  `json:"error-codes,omitempty"`
}

var recaptchaSiteVerifyUrl = "https://www.google.com/recaptcha/api/siteverify"
var recaptchaHeader = "x-recaptcha-token"


var CreateAccount = func(w http.ResponseWriter, r *http.Request) {
	var useRecaptcha, err = strconv.ParseBool(os.Getenv("REACT_APP_USE_RECAPTCHA"))
	if err != nil {
		log.Println("Wrong value for USE_RECAPTCHA")
		useRecaptcha = false
	}
	if useRecaptcha {
		recaptchaToken := r.Header.Get(recaptchaHeader)
		remoteIp := r.RemoteAddr
		if recaptchaHeader == "" {
			u.RespondJson(w, u.Response{Message: "No recaptcha", ErrorCode: u.ErrGeneral}, http.StatusForbidden)
			return
		}
		log.Println(fmt.Sprintf("An attempt to register a user from %s", remoteIp))

		formValues := url.Values{
			"secret": {os.Getenv("RECAPTCHA_SECRET_KEY")},
			"response": {recaptchaToken},
			"remoteip": {remoteIp},
		}
		response, err := http.PostForm(recaptchaSiteVerifyUrl, formValues)
		if err != nil {
			u.RespondJson(w, u.Response{Message: fmt.Sprintf("error posting to recaptcha endpoint: '%s'", err), ErrorCode: u.ErrGeneral}, http.StatusBadRequest)
			return
		}
		defer response.Body.Close()
		resultBody, err := ioutil.ReadAll(response.Body)
		if err != nil {
			u.RespondJson(w, u.Response{Message: fmt.Sprintf("couldn't read response body: '%s'", err), ErrorCode: u.ErrGeneral}, http.StatusBadRequest)
			return
		}
		var result reCHAPTCHAResponse
		err = json.Unmarshal(resultBody, &result)
		if err != nil {
			u.RespondJson(w, u.Response{Message: fmt.Sprintf("invalid response body json: '%s'", err), ErrorCode: u.ErrGeneral}, http.StatusBadRequest)
			return
		}
		if result.ErrorCodes != nil {
			u.RespondJson(w, u.Response{Message: fmt.Sprintf("remote error codes: %v", result.ErrorCodes), ErrorCode: u.ErrGeneral}, http.StatusBadRequest)
			return
		}
		if !result.Success {
			u.RespondJson(w, u.Response{Message: fmt.Sprintf("invalid challenge solution"), ErrorCode: u.ErrGeneral}, http.StatusBadRequest)
			return
		}
	}

	account := &m.Account{}
	err = json.NewDecoder(r.Body).Decode(account)
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
	tplv["link"] = fmt.Sprintf("%s%s?t=%s", os.Getenv("REACT_APP_HOST_API"), middleware.Routes["v1"]["confirmEmail"], account.ConfirmationToken.Value)
	tplv["email"] = account.Email
	tplv["name"] = account.Name
	// Send email
	go SendEmail(account.Email, "Создание учетной записи - Подтверждение Email", "info", tplv, "tpl/confirmation_email.html")

	p := make(map[string]interface{})
	p["id"] = account.ID
	p["email"] = account.Email
	u.RespondJson(w, u.Response{Payload: p}, http.StatusCreated)
}

var CreateAssistant = func(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	body := &Body{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	// Generate random password
	password := u.TokenGenerator(5)
	account := &m.Account{
		Email: body.Email,
		Name:  body.Name,
		Role:  middleware.RoleAssistant,
		Password: &m.Password{
			Raw:          password,
			Confirmation: password,
		},
	}
	err = s.AccountService.Create(account)
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	tplv := make(map[string]string)
	tplv["link"] = fmt.Sprintf("%s%s?t=%s", os.Getenv("REACT_APP_HOST_API"), middleware.Routes["v1"]["confirmEmail"], account.ConfirmationToken.Value)
	tplv["email"] = account.Email
	tplv["password"] = password
	tplv["name"] = account.Name
	// Send email
	go SendEmail(account.Email, "Создание учетной записи ассистента - Подтверждение Email", "info", tplv, "tpl/confirmation_email_assistant.html")

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
	account, err := s.AccountService.Get(uint(id))
	if err != nil {
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
	accounts, total, err := s.AccountService.Find(offset, limit, role)
	if err != nil {
		log.Printf("Error! Cound not fetch accounts")
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.PaginatedResponse{Payload: u.PaginatedResponsePayload{Size: limit, Page: offset, Total: total, Data: accounts}}, http.StatusOK)
}

var GetUsersPlain = func(w http.ResponseWriter, r *http.Request) {
	accounts, err := s.AccountService.GetPlainList(middleware.RoleUser)
	if err != nil {
		log.Printf("Error! Cound not fetch users")
		u.RespondJson(w, u.Response{Message: "An Error occurred", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: accounts}, http.StatusOK)
}

var GetAssistantsPlain = func(w http.ResponseWriter, r *http.Request) {
	accounts, err := s.AccountService.GetPlainList(middleware.RoleAssistant)
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
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	account := &m.Account{}
	err2 := json.NewDecoder(r.Body).Decode(account)
	if err2 != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	ctx := r.Context().Value(0).(u.ContextPayload)
	issuerId := ctx.Get("user")
	if issuerId == "" {
		log.Println("Error! Secure route has no user stored in context")
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
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
	type Body struct {
		ID string `json:"id"`
	}
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
		return
	}
	token := &m.Token{
		Value:     u.TokenGenerator(32),
		ExpiresAt: time.Now().Add(time.Hour * time.Duration(24)),
		Type:      s.TypeReset,
		Expired:   false,
	}
	if account.ResetToken != nil {
		token.ID = account.ResetToken.ID
	}
	account.ResetToken = token
	err = m.GetDB().Save(account).Error
	if err != nil { // Ignore error and respond with success to avoid sniffing
		log.Printf("Cannot set new reset password")
		return
	}

	tplv := make(map[string]string)
	tplv["link"] = fmt.Sprintf("%s/reset?t=%s", os.Getenv("REACT_APP_HOST_PUBLIC"), account.ResetToken.Value)
	tplv["email"] = account.Email
	go SendEmail(account.Email, "Password reset", "info", tplv, "tpl/reset_email.html")

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
	pwd := &m.Password{}
	hash, _ := bcrypt.GenerateFromPassword(
		[]byte(password), bcrypt.DefaultCost,
	)
	if t.Account.Password != nil {
		pwd.ID = t.Account.Password.ID
	}
	pwd.Hash = string(hash)
	t.Account.Password = pwd
	t.Expired = true
	if err := tx.Save(t).Error; err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func SendEmail(to string, subject string, from string, data interface{}, tplPath string) {
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
	html := buffer.String()

	log.Printf("Trying to send email to %s\n", to)

	// Credentials
	domain := os.Getenv("MG_DOMAIN")
	apiKey := os.Getenv("MG_API_KEY")

	// Mime parts:
	subject = "Subject: " + subject + "\n"
	to = fmt.Sprintf(fmt.Sprintf("To: %s", to)) + "\n"
	from = fmt.Sprintf(fmt.Sprintf("From: %s@%s", from, domain)) + "\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset='UTF-8';\n\n"
	body := subject + from + to + mime + html

	mg := mailgun.NewMailgun(domain, apiKey)
	message := mg.NewMIMEMessage(ioutil.NopCloser(strings.NewReader(body)), to)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	// Send the message with a 10 second timeout
	resp, id, err := mg.Send(ctx, message)

	if err != nil {
		log.Println("Cannot send email", err)
	} else {
		log.Printf("Mail to %s has been sent successfully; ID: %s; Response: %s\n", to, id, resp)
	}
}
