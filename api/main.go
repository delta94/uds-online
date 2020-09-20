package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
	"uds-online/api/controllers"
	mw "uds-online/api/middleware"
)

func main() {
	router := mux.NewRouter()

	// Common Middleware
	if os.Getenv("IS_PRODUCTION") == "" {
		// in production, CORS is handled by NGINX
		router.Use(mw.CorsMiddleware)
	}

	fileServer := http.FileServer(http.Dir("./uploaded"))
	router.PathPrefix("/uploaded/").Handler(http.StripPrefix("/uploaded", controllers.Neuter(fileServer))).Methods("GET", "OPTIONS")

	// Handle Routes

	router.Handle(mw.Routes["v1"]["landing"], http.HandlerFunc(controllers.LandingPage)).Methods("GET")
	router.Handle(mw.Routes["v1"]["register"], mw.XhrMiddleware(http.HandlerFunc(controllers.CreateAccount))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["auth"], mw.XhrMiddleware(controllers.Authenticate([]int{mw.RoleUser}))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["authAdmin"], mw.XhrMiddleware(controllers.Authenticate([]int{mw.RoleAdmin, mw.RoleAssistant}))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["resetPassword"], mw.XhrMiddleware(http.HandlerFunc(controllers.IssuePasswordReset))).Methods("POST", "OPTIONS")
	router.HandleFunc(mw.Routes["v1"]["confirmEmail"], controllers.ConfirmEmail).Methods("GET", "OPTIONS")

	router.Handle(mw.Routes["v1"]["register"]+"/assistant", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CreateAssistant), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAccounts), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/users", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetUsersPlain), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/assistants", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAssistantsPlain), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/confirm", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.ManualEmailConfirm), []int{mw.RoleAdmin}))).Methods("POST")
	router.Handle(mw.Routes["v1"]["accounts"]+"/change-block", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.ChangeAccountBlockState), []int{mw.RoleAdmin}))).Methods("POST")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetAccount), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.UpdateAccount), []int{mw.RoleAdmin}))).Methods("PUT", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.DeleteAccount), []int{mw.RoleAdmin}))).Methods("DELETE", "OPTIONS")
	router.Handle(mw.Routes["v1"]["accounts"]+"/reset-password", mw.XhrMiddleware(http.HandlerFunc(controllers.ResetPassword))).Methods("POST", "OPTIONS")

	// create course (Admin)
	router.Handle(mw.Routes["v1"]["adminCourses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CreateCourse), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")
	// copy course (Admin)
	router.Handle(mw.Routes["v1"]["adminCourses"]+"/{id}/copy", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CopyCourse), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")
	// update course (Admin)
	router.Handle(mw.Routes["v1"]["adminCourses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.UpdateCourse), []int{mw.RoleAdmin}))).Methods("PUT", "OPTIONS")
	// get courses (Admin)
	router.Handle(mw.Routes["v1"]["adminCourses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCoursesAdmin), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	// get course (Admin)
	router.Handle(mw.Routes["v1"]["adminCourses"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCourseAdmin), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")

	// get course (public)
	router.Handle(mw.Routes["v1"]["courses"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCourse), []int{mw.RoleUser}))).Methods("GET", "OPTIONS")
	// get courses (public)
	router.Handle(mw.Routes["v1"]["courses"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetCourses), []int{mw.RoleUser}))).Methods("GET", "OPTIONS")
	// save task answer
	router.Handle(mw.Routes["v1"]["courses"]+"/{course_id}/lessons/{lesson_id}/save-answer", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.SaveTaskAnswer), []int{mw.RoleUser}))).Methods("POST", "OPTIONS")

	// get lesson (public)
	router.Handle(mw.Routes["v1"]["lessons"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetLesson), []int{mw.RoleUser}))).Methods("GET", "OPTIONS")




	// create lesson (Admin)
	router.Handle(mw.Routes["v1"]["adminLessons"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CreateLesson), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")
	// update lesson (Admin)
	router.Handle(mw.Routes["v1"]["adminLessons"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.UpdateLesson), []int{mw.RoleAdmin}))).Methods("PUT", "OPTIONS")
	// get lesson (Admin)
	router.Handle(mw.Routes["v1"]["adminLessons"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetLessonAdmin), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")

	// get purchases
	router.Handle(mw.Routes["v1"]["purchases"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetPurchases), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	// create purchase
	router.Handle(mw.Routes["v1"]["purchases"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.CreatePurchase), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")

	// Upload
	router.Handle(mw.Routes["v1"]["uploads"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.HandleLocalUpload), []int{mw.RoleAdmin}))).Methods("POST", "OPTIONS")
	router.Handle(mw.Routes["v1"]["uploads"]+"/{id}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.DeleteUpload), []int{mw.RoleAdmin}))).Methods("DELETE", "OPTIONS")
	router.Handle(mw.Routes["v1"]["uploads"], mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetUploads), []int{mw.RoleAdmin}))).Methods("GET", "OPTIONS")
	router.Handle(mw.Routes["v1"]["uploads"]+"/{alias}", mw.XhrMiddleware(mw.JwtAuthMiddleware(http.HandlerFunc(controllers.GetFilePath), []int{mw.RoleAdmin, mw.RoleUser, mw.RoleAssistant}))).Methods("GET", "OPTIONS")

	// Port
	port := "7000"

	log.Println(fmt.Sprintf("App's running on port: %s", port))

	if err := http.ListenAndServe(":" + port, router); err != nil {
		panic(err)
	}
}
