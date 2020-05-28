package controllers

import (
	"html/template"
	"log"
	"net/http"
)

const tplPath = "tpl/landing.html"

var LandingPage = func(w http.ResponseWriter, r *http.Request) {
	log.Println("Opening Landing page")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	t, err := template.ParseFiles(tplPath)
	if err != nil {
		log.Println("Could load template", err.Error())
		return
	}
	t.Execute(w, nil)
}
