package middleware

import (
	"net/http"
)

var CorsMiddleware = func(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-request-client")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		next.ServeHTTP(w, r)
	})
}
