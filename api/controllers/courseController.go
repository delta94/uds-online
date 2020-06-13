package controllers

import (
	"encoding/json"
	"net/http"
	m "uds-online/api/models"
	srv "uds-online/api/services"
	u "uds-online/api/utils"
)

var CreateCourse = func(w http.ResponseWriter, r *http.Request) {
	course := &m.Course{}
	err := json.NewDecoder(r.Body).Decode(course)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = srv.CourseService.Create(course)
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	payload := make(map[string]interface{})
	payload["ID"] = course.ID
	payload["title"] = course.Title
	payload["published"] = course.Published
	payload["CreatedAt"] = course.CreatedAt
	u.RespondJson(w, u.Response{Payload: payload}, http.StatusCreated)
}

var GetCourse = func(w http.ResponseWriter, r *http.Request) {

}

var GetCourses = func(w http.ResponseWriter, r *http.Request) {

}

var GetCourseAdmin = func(w http.ResponseWriter, r *http.Request) {

}

var GetCoursesAdmin = func(w http.ResponseWriter, r *http.Request) {
	courses, err := srv.CourseService.FindAll()
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w,  u.Response{Payload: courses},  http.StatusOK)
}
