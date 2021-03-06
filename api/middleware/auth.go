package middleware

import (
	"context"
	"github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	m "uds-online/api/models"
	u "uds-online/api/utils"
)

const RoleUser int = 1
const RoleAdmin int = 2
const RoleAssistant int = 3

const authHeader = "Authorization"

var JwtAuthMiddleware = func(next http.Handler, roles []int) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenHeader := r.Header.Get(authHeader)

		// Token is missing
		if tokenHeader == "" {
			u.RespondJson(w, u.Response{Message: "Missing authentication data"}, http.StatusForbidden)
			return
		}
		// Check token's format
		split := strings.Split(tokenHeader, " ")
		if len(split) != 2 { // Bearer xxx
			u.RespondJson(w, u.Response{Message: "Invalid/Malformed authentication token"}, http.StatusForbidden)
			return
		}
		// Parse "Authorization" header's value
		tokenPart := split[1]
		tk := &m.JWTToken{}
		token, err := jwt.ParseWithClaims(tokenPart, tk, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SECRET")), nil
		})
		// Malformed token
		if err != nil {
			u.RespondJson(w, u.Response{Message: "Malformed authentication token", ErrorCode: u.ErrMalformedToken}, http.StatusForbidden)
			return
		}
		// Token is invalid
		if !token.Valid {
			u.RespondJson(w, u.Response{Message: "Token is not valid", ErrorCode: u.ErrAuth}, http.StatusBadRequest)
			return
		}
		// Fetch User related to token
		account := &m.Account{}
		err = m.GetDB().Unscoped().Take(account, "id = ?", tk.Issuer).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				u.RespondJson(w, u.Response{Message: "user not found", ErrorCode: u.ErrAuth}, http.StatusOK)
				return
			}
			u.RespondJson(w, u.Response{Message: "connection error. Please retry", ErrorCode: u.ErrAuth}, http.StatusOK)
			return
		}
		authorized := false
		for _, r := range roles {
			if r == account.Role {
				authorized = true
			}
		}
		if !authorized {
			log.Printf("An attempt to use Role-protected route by [%s]. Access denied.\n", account.ID)
			u.RespondJson(w, u.Response{Message: "Not authorized", ErrorCode: u.ErrForbidden}, http.StatusForbidden)
			return
		}
		// Generate context
		ctx := u.ContextPayload{M: map[string]string{
			"user": tk.Issuer,
			"role": strconv.Itoa(account.Role),
		}}
		r = r.WithContext(context.WithValue(r.Context(), 0, ctx))
		next.ServeHTTP(w, r)
	})
}
