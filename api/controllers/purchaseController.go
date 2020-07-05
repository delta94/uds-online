package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	m "uds-online/api/models"
	s "uds-online/api/services"
	u "uds-online/api/utils"
)

var CreatePurchase = func(w http.ResponseWriter, r *http.Request) {
	purchase := &m.Purchase{}
	err := json.NewDecoder(r.Body).Decode(purchase)
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = s.PurchaseService.Create(purchase)
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	p := make(map[string]interface{})
	p["ID"] = purchase.ID.String()
	p["sum"] = purchase.Sum
	p["course_id"] = purchase.CourseID

	u.RespondJson(w, u.Response{Payload: p}, http.StatusCreated)
}

var GetPurchases = func(w http.ResponseWriter, r *http.Request) {
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

	purchases, total, err := s.PurchaseService.Find(offset, limit)
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.PaginatedResponse{Payload: u.PaginatedResponsePayload{Size: limit, Total: total, Page: offset, Data: purchases}}, http.StatusOK)
}
