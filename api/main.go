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

	fileServer := http.FileServer(http.Dir("./static"))
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static", controllers.Neuter(fileServer))).Methods("GET", "OPTIONS")

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
	router.Handle(mw.Routes["v1"]["accounts"]+"/assistants", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAssistants), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/confirm", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.ManualEmailConfirm), []int{mw.RoleAdmin}))).Methods("POST")
	router.Handle(mw.Routes["v1"]["accounts"]+"/change-block", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.ChangeAccountBlockState), []int{mw.RoleAdmin}))).Methods("POST")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAccount), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.UpdateAccount), []int{mw.RoleAdmin}))).Methods("PUT", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.DeleteAccount), []int{mw.RoleAdmin}))).Methods("DELETE", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/reset-password", mw.XhrMiddleware(http.HandlerFunc(controllers.ResetPassword))).Methods("POST", "OPTIONS")

	// create course
	router.Handle(mw.Routes["v1"]["adminCourses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CreateCourse), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")
	// update course
	router.Handle(mw.Routes["v1"]["adminCourses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.UpdateCourse), []int{mw.RoleAdmin}))).Methods("PUT", "OPTIONS")
	// get courses
	router.Handle(mw.Routes["v1"]["adminCourses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCoursesAdmin), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	// get course
	router.Handle(mw.Routes["v1"]["adminCourses"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCourseAdmin), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")

	router.Handle(mw.Routes["v1"]["courses"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCourse), []int{mw.RoleUser}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["courses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCourses), []int{mw.RoleUser}))).Methods("GET", "OPTIONS")

	// get purchases
	router.Handle(mw.Routes["v1"]["purchases"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetPurchases), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	// create purchase
	router.Handle(mw.Routes["v1"]["purchases"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CreatePurchase), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")

	// Upload
	router.HandleFunc("/api/v1/uploads", controllers.HandleLocalUpload).Methods("POST", "OPTIONS")

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
