package controllers

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"strconv"
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

var UpdateCourse = func(w http.ResponseWriter, r *http.Request) {
	course := &m.Course{}
	err := json.NewDecoder(r.Body).Decode(course)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = course.Validate()
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	fields := make(map[string]interface{})
	fields["title"] = course.Title
	fields["annotation"] = course.Annotation
	fields["price"] = course.Price
	fields["assistant_id"] = course.AssistantID
	fields["published"] = course.Published
	err = srv.CourseService.Update(course.ID, fields)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Could not update course", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Message: "Update complete"}, http.StatusOK)

}

var GetCourse = func(w http.ResponseWriter, r *http.Request) {

}

var GetCourses = func(w http.ResponseWriter, r *http.Request) {

}

var GetCourseAdmin = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	course, err := srv.CourseService.GetForAdmin(uint(id))
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: course}, http.StatusOK)
}

var GetCoursesAdmin = func(w http.ResponseWriter, r *http.Request) {
	courses, err := srv.CourseService.FindAllForAdmin()
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: courses}, http.StatusOK)
}

var CreateLesson = func(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		Title      string          `json:"title"`
		Annotation string          `json:"annotation"`
		Paid       bool            `json:"paid"`
		Content    string          `json:"content"`
		CourseID   uint            `json:"course_id"`
		Tasks      []*m.LessonTask `json:"tasks"`
	}

	body := &Body{}
	err := json.NewDecoder(r.Body).Decode(body)
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	// get rid of IDs in case they are given
	for _, t := range body.Tasks {
		t.ID = 0
	}
	lesson := &m.Lesson{
		CourseID:   body.CourseID,
		Title:      body.Title,
		Annotation: body.Annotation,
		Paid:       body.Paid,
		Content: &m.LessonContent{
			Body: body.Content,
			Tasks: body.Tasks,
		},
	}
	err = srv.LessonService.Create(lesson)
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}

	p := make(map[string]interface{})
	p["ID"] = lesson.ID
	p["title"] = lesson.Title
	u.RespondJson(w, u.Response{Payload: p}, http.StatusOK)
}


var GetLessonAdmin = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	lesson, err := srv.LessonService.Get(uint(id))
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error()}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: lesson}, http.StatusOK)
}