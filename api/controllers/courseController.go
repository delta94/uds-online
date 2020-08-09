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
	err = srv.CourseService.Update(course)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Could not update course", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Message: "Update complete"}, http.StatusOK)
}

var GetCourse = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	ctx := r.Context().Value(0).(u.ContextPayload)
	course, err := srv.CourseService.Get(uint(id), ctx.Get("user"))
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: course}, http.StatusOK)
}

var GetCourses = func(w http.ResponseWriter, r *http.Request) {
	offset, err1 := strconv.Atoi(r.URL.Query().Get("p"))
	limit, err2 := strconv.Atoi(r.URL.Query().Get("s"))
	if err1 != nil {
		offset = 0
	}
	if err2 != nil {
		limit = 10
	}
	if limit == 0 || limit > 50 {
		limit = 10
	}
	courses, total, err := srv.CourseService.Find(offset, limit)

	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.PaginatedResponse{Payload: u.PaginatedResponsePayload{Size: limit, Page: offset, Total: total, Data: courses}}, http.StatusOK)
}

var GetLesson = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	ctx := r.Context().Value(0).(u.ContextPayload)
	course, err := srv.CourseService.GetLesson(uint(id), ctx.Get("user"))
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusPaymentRequired)
		return
	}
	u.RespondJson(w, u.Response{Payload: course}, http.StatusOK)
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

var CopyCourse = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	course, err := srv.CourseService.Copy(uint(id))
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error()}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.Response{Payload: course}, http.StatusOK)
}

var CopyLesson = func(w http.ResponseWriter, r *http.Request) {

}

var CreateLesson = func(w http.ResponseWriter, r *http.Request) {
	lesson := &m.Lesson{}
	err := json.NewDecoder(r.Body).Decode(lesson)
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	if lesson.ID != 0 || lesson.Content.ID != 0 {
		log.Print("Some id provided for creating lesson")
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	// get rid of IDs in case they are given
	for _, t := range lesson.Content.Tasks {
		t.ID = 0
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

var UpdateLesson = func(w http.ResponseWriter, r *http.Request) {
	lesson := &m.Lesson{}
	err := json.NewDecoder(r.Body).Decode(lesson)
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = lesson.Validate()
	if err != nil {
		log.Print(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	if lesson.ID == 0 || lesson.Content.ID == 0 || lesson.CourseID == 0 {
		log.Print("No id provided for updating lesson")
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = srv.LessonService.Update(lesson)
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
