package utils

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

type IRespondData interface{}

type Response struct {
	IRespondData `json:"-"`
	Payload      interface{} `json:"payload"`
	ErrorCode    int         `json:"error_code"`
	Message      string      `json:"message"`
}

type PaginatedResponsePayload struct {
	Size  int         `json:"size"`
	Page  int         `json:"page"`
	Total uint        `json:"total"`
	Data  interface{} `json:"data"`
}

type PaginatedResponse struct {
	IRespondData `json:"-"`
	Payload      PaginatedResponsePayload `json:"payload"`
	ErrorCode    int                      `json:"error_code"`
	Message      string                   `json:"message"`
}

func RespondJson(w http.ResponseWriter, data IRespondData, status int) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func LoadEnv() {
	log.Println("Loading env values...")
	os.Setenv("IS_PRODUCTION", "true")
	for _, arg := range os.Args {
		if arg == "--dev" {
			envFile := ".env.development"
			os.Setenv("IS_PRODUCTION", "")
			godotenv.Load(envFile)
			log.Printf("Environment's been set as DEVELOPMENT")
			break
		}
	}
}

func TokenGenerator(bytes int) string {
	b := make([]byte, bytes)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

type ContextPayload struct {
	M map[string]string
}

func (c *ContextPayload) Get(key string) string {
	return c.M[key]
}

type ErrorData struct {
	Error error
	Code  int
}
