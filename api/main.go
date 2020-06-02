package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"os"
	"uds-online/api/controllers"
	mw "uds-online/api/middleware"
)

func main() {
	router := mux.NewRouter()

	// Common Middleware
	if os.Getenv("IS_PRODUCTION") == "" {
		router.Use(mw.CorsMiddleware)
	}

	// Handle Routes
	// Public Routes
	router.Handle(mw.Routes["v1"]["landing"], http.HandlerFunc(controllers.LandingPage)).Methods("GET")
	router.Handle(mw.Routes["v1"]["register"], mw.XhrMiddleware(http.HandlerFunc(controllers.CreateAccount))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["auth"], mw.XhrMiddleware(controllers.Authenticate([]int{mw.RoleUser}))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["authAdmin"], mw.XhrMiddleware(controllers.Authenticate([]int{mw.RoleAdmin, mw.RoleAssistant}))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["resetPassword"], mw.XhrMiddleware(http.HandlerFunc(controllers.IssuePasswordReset))).Methods("POST", "OPTIONS")
	router.HandleFunc(mw.Routes["v1"]["confirmEmail"], controllers.ConfirmEmail).Methods("GET", "OPTIONS")

	// Secure Routes
	router.Handle(mw.Routes["v1"]["accounts"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAccounts), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/confirm", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.ManualEmailConfirm), []int{mw.RoleAdmin}))).Methods("POST")
	router.Handle(mw.Routes["v1"]["accounts"]+"/change-block", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.ChangeAccountBlockState), []int{mw.RoleAdmin}))).Methods("POST")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAccount), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.UpdateAccount), []int{mw.RoleAdmin}))).Methods("PUT", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.DeleteAccount), []int{mw.RoleAdmin}))).Methods("DELETE", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/reset-password", mw.XhrMiddleware(http.HandlerFunc(controllers.ResetPassword))).Methods("POST", "OPTIONS")

	// S3
	//router.HandleFunc("/api/v1/uploads", controllers.ListS3Uploads).Methods("POST")

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "7000"
	}

	fmt.Println("App's running on port:", port)

	err := http.ListenAndServe(":"+port, router)
	if err != nil {
		panic(err)
	}
}
