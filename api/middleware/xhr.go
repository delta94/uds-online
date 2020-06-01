package middleware

import (
	"log"
	"net/http"
	u "uds-online/api/utils"
)

const customAppHeader = "x-request-client"

var XhrMiddleware = func(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			return
		}
		appHeader := r.Header.Get(customAppHeader)
		if appHeader == "" {
			log.Printf("Unauthorized request: missing '%s' header\n", customAppHeader)
			u.RespondJson(w, u.Response{Message: "Missing authentication data", ErrorCode: u.ErrAuth}, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
