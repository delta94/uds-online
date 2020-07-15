package controllers

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	m "uds-online/api/models"
	srv "uds-online/api/services"
	u "uds-online/api/utils"
	"unicode/utf8"
)

var StaticServe = func(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("uploaded"))
}

var Neuter = func(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		cookies := r.Header.Get("Cookie")
		if cookies == "" {
			u.RespondJson(w, u.Response{Message: "Not authorized", ErrorCode: u.ErrForbidden}, http.StatusForbidden)
			return
		}
		cookieParts := strings.Split(cookies, ";")
		tokenPart := ""
		for _, cp := range cookieParts {
			kv := strings.Split(cp, "=")
			for _, v := range kv {
				k := strings.Trim(v, " ")
				if k == "_token" || k == "token" {
					tokenPart = kv[1]
				}
			}
		}
		if tokenPart == "" {
			u.RespondJson(w, u.Response{Message: "Invalid credentials", ErrorCode: u.ErrForbidden}, http.StatusForbidden)
			return
		}
		tk := &m.JWTToken{}
		token, err := jwt.ParseWithClaims(tokenPart, tk, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SECRET")), nil
		})
		// Malformed token
		if err != nil {
			u.RespondJson(w, u.Response{Message: "Invalid credentials", ErrorCode: u.ErrMalformedToken}, http.StatusForbidden)
			return
		}
		// Token is invalid
		if !token.Valid {
			u.RespondJson(w, u.Response{Message: "Invalid credentials", ErrorCode: u.ErrAuth}, http.StatusBadRequest)
			return
		}
		log.Println("Serving content...")
		next.ServeHTTP(w, r)
	})
}

var tmpPath = filepath.Join(".", "tmp")

var HandleLocalUpload = func(w http.ResponseWriter, r *http.Request) {
	os.MkdirAll(tmpPath, os.ModePerm)

	maxSizeMB, err := strconv.Atoi(os.Getenv("REACT_APP_MAX_UPLOAD_SIZE"))
	if err != nil {
		log.Println("Wrong file size limit", err.Error())
		u.RespondJson(w, u.Response{Message: "Could not upload file. File size limit is wrong", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = r.ParseMultipartForm(int64(1000 * 1000 * maxSizeMB))
	if err != nil {
		log.Println("Could not upload file!", err.Error())
		u.RespondJson(w, u.Response{Message: fmt.Sprintf("File too large. Max Size: %v MB", maxSizeMB), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	comment := r.FormValue("comment")
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		log.Println("Could not upload file!", err.Error())
		u.RespondJson(w, u.Response{Message: "Could not upload file", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	if utf8.RuneCountInString(fileHeader.Filename) > 80 {
		log.Println("Filename is too long")
		u.RespondJson(w, u.Response{Message: "Filename is too long", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	mimeType := fileHeader.Header.Get("Content-Type")
	err = CheckMimeType(mimeType)
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	defer file.Close()

	tempFile, err := ioutil.TempFile(tmpPath, "tmp-*")
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	defer tempFile.Close()
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	_, err = tempFile.Write(fileBytes)
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}

	uuid, _ := uuid.NewV4()
	newPath := filepath.Join(".", "uploaded", strings.ToLower(fmt.Sprintf("%s%s", uuid.String(), path.Ext(fileHeader.Filename))))

	err = MoveFile(tempFile.Name(), newPath)
	if err != nil {
		log.Println("Cannot move file", err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	upload := &m.Upload{
		Path:         newPath,
		OriginalName: fileHeader.Filename,
		Comment:      comment,
		Type:         strings.Split(mimeType, "/")[0],
	}
	err = srv.UploadService.Create(upload)
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}

	payload := make(map[string]interface{})
	payload["originalName"] = fileHeader.Filename
	payload["alias"] = upload.Alias
	payload["comment"] = upload.Comment
	payload["path"] = upload.Path

	u.RespondJson(w, u.Response{Payload: payload, Message: fmt.Sprintf("File uploaded successfully [%v]", fileHeader.Filename)}, http.StatusOK)
}

var GetFilePath = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	alias := params["alias"]
	if alias == "" {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}
	upload := &m.Upload{}
	err := m.GetDB().Take(upload, "alias = ?", alias).Error
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: "Path not found", ErrorCode: u.ErrNotFound}, http.StatusNotFound)
		return
	}
	payload := make(map[string]interface{})
	payload["path"] = upload.Path
	payload["type"] = upload.Type
	u.RespondJson(w, u.Response{Payload: payload}, http.StatusOK)
}

var GetUploads = func(w http.ResponseWriter, r *http.Request) {
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
	uploads, total, err := srv.UploadService.Find(offset, limit)
	if err != nil {
		log.Printf("Error! Cound not fetch accounts")
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	u.RespondJson(w, u.PaginatedResponse{Payload: u.PaginatedResponsePayload{Size: limit, Page: offset, Total: total, Data: uploads}}, http.StatusOK)
}

var DeleteUpload = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		u.RespondJson(w, u.Response{Message: "Invalid request"}, http.StatusOK)
		return
	}

	upload, err := srv.UploadService.Get(uint(id))
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: fmt.Sprint("Upload not found"), ErrorCode: u.ErrGeneral}, http.StatusConflict)
		return
	}

	p := filepath.Join(".", upload.Path)
	log.Printf("Trying to delete file '%s'from FS...", p)
	if _, err1 := os.Stat(p); err1 == nil {
		err = os.Remove(p)
		if err != nil {
			log.Printf("Coult not delete file '%s' after removing it's record in DB\n", upload.Path)
			u.RespondJson(w, u.Response{Message: fmt.Sprintf("Coult not delete file '%s' after removing it's record in DB\n", upload.Path), ErrorCode: u.ErrGeneral}, http.StatusConflict)
			return
		}
		log.Printf("Successfully deleted file '%s'\n from FS", upload.Path)
	} else {
		log.Println("Could not locate file for deleting", err1)
	}
	err = srv.UploadService.Delete(uint(id))
	if err != nil {
		log.Println(err.Error())
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusConflict)
		return
	}
	u.RespondJson(w, u.Response{Message: "ok"}, http.StatusOK)
}

func CheckMimeType(mimeType string) error {
	mimeTypes := [...]string{
		"video/quicktime",
		"video/mpeg",
		"video/mp4",
		"image/png",
		"image/jpg",
		"image/jpeg",
		"audio/mpeg",
		"audio/wav",
	}
	for _, b := range mimeTypes {
		if b == mimeType {
			return nil
		}
	}
	return fmt.Errorf("not supported mimetype")
}

func MoveFile(sourcePath, destPath string) error {
	inputFile, err := os.Open(sourcePath)
	if err != nil {
		return fmt.Errorf("couldn't open source file: %s", err)
	}
	outputFile, err := os.Create(destPath)
	if err != nil {
		inputFile.Close()
		return fmt.Errorf("couldn't open dest file: %s", err)
	}
	defer outputFile.Close()
	_, err = io.Copy(outputFile, inputFile)
	inputFile.Close()
	if err != nil {
		return fmt.Errorf("writing to output file failed: %s", err)
	}
	// The copy was successful, so now delete the original file
	err = os.Remove(sourcePath)
	if err != nil {
		return fmt.Errorf("failed removing original file: %s", err)
	}
	return nil
}
