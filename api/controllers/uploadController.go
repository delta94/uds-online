package controllers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	u "uds-online/api/utils"
)

var StaticServe = func(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("static"))
}

var Neuter = func(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

var HandleLocalUpload = func(w http.ResponseWriter, r *http.Request) {
	maxSizeMB, err := strconv.Atoi(os.Getenv("MAX_UPLOAD_SIZE_MB"))
	if err != nil {
		log.Println("Wrong file size limit", err.Error())
		u.RespondJson(w, u.Response{Message: "Could not upload file. File size limit is wrong", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	err = r.ParseMultipartForm(int64(1024 * 1024 * maxSizeMB))
	if err != nil {
		log.Println("Could not upload file!", err.Error())
		u.RespondJson(w, u.Response{Message: fmt.Sprintf("File too large. Max Size: %v MB", maxSizeMB), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		log.Println("Could not upload file!", err.Error())
		u.RespondJson(w, u.Response{Message: "Could not upload file", ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}

	mimeType := fileHeader.Header.Get("Content-Type")
	err = CheckMimeType(mimeType)
	if err != nil {
		u.RespondJson(w, u.Response{Message: err.Error(), ErrorCode: u.ErrGeneral}, http.StatusOK)
		return
	}
	defer file.Close()
	folder := "videos"
	if strings.Contains(mimeType, "image/") {
		folder = "images"
	}
	tempFile, err := ioutil.TempFile("static/"+folder, "upload-*"+path.Ext(fileHeader.Filename))
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
	payload := make(map[string]interface{})
	payload["originalName"] = fileHeader.Filename
	u.RespondJson(w, u.Response{Payload: payload, Message: fmt.Sprintf("File uploaded successfully [%v]", fileHeader.Filename)}, http.StatusOK)
}

func CheckMimeType(mimeType string) error {
	mimeTypes := [...]string{"video/quicktime","video/mpeg","video/mp4","image/png","image/jpg","image/jpeg"}
	for _, b := range mimeTypes {
		if b == mimeType {
			return nil
		}
	}
	return fmt.Errorf("not supported mimetype")
}

//var GetCredentials = func(w http.ResponseWriter, r *http.Request) {
//	maxSizeMB, err := strconv.Atoi(os.Getenv("MAX_UPLOAD_SIZE_MB"))
//	if err != nil {
//		log.Println("Wrong file size limit", err.Error())
//		u.RespondJson(w, u.Response{Message: "Could not upload file. File size limit is wrong", ErrorCode: u.ErrGeneral}, http.StatusOK)
//	}
//	err = r.ParseMultipartForm(int64(1024 * 1024 * maxSizeMB))
//	if err != nil {
//		log.Println("Could not upload file!", err.Error())
//		u.RespondJson(w, u.Response{Message: fmt.Sprintf("File too large. Max Size: %v MB", maxSizeMB), ErrorCode: u.ErrGeneral}, http.StatusOK)
//		return
//	}
//
//	file, fileHeader, err := r.FormFile("file")
//	if err != nil {
//		log.Println("Could not upload file!", err.Error())
//		u.RespondJson(w, u.Response{Message: "Could not upload file", ErrorCode: u.ErrGeneral}, http.StatusOK)
//		return
//	}
//	defer file.Close()
//	sess, err := session.NewSession(&aws.Config{
//		Region:      aws.String(os.Getenv("AWS_REGION")),
//		Credentials: credentials.NewEnvCredentials(),
//	})
//	if err != nil {
//		log.Println("Could not upload file!", err.Error())
//		u.RespondJson(w, u.Response{Message: "Could not upload file", ErrorCode: u.ErrGeneral}, http.StatusOK)
//		return
//	}
//
//	objectKey, err := UploadFileToS3(sess, file, fileHeader)
//
//	if err != nil {
//		log.Println("Could not upload file!", err.Error())
//		u.RespondJson(w, u.Response{Message: "Could not upload file", ErrorCode: u.ErrGeneral}, http.StatusOK)
//		return
//	}
//	payload := make(map[string]interface{})
//	payload["originalName"] = fileHeader.Filename
//	payload["objectKey"] = objectKey
//	u.RespondJson(w, u.Response{Payload: payload, Message: fmt.Sprintf("File uploaded successfully [%v]", objectKey)}, http.StatusOK)
//}

//func UploadFileToS3(s *session.Session, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
//	size := fileHeader.Size
//	buffer := make([]byte, size)
//	file.Read(buffer)
//
//	// create a unique file name for the file
//	t := time.Now()
//	tmpName := fmt.Sprintf("%d%02d%02d%02d%02d%02d%02d-video%v",
//		t.Year(),
//		t.Month(),
//		t.Day(),
//		t.Hour(),
//		t.Minute(),
//		t.Second(),
//		t.Nanosecond()/1000,
//		path.Ext(fileHeader.Filename),
//	)
//	objectKey := "videos/" + tmpName
//	_, err := s3.New(s).PutObject(&s3.PutObjectInput{
//		Bucket:               aws.String(os.Getenv("AWS_S3_BUCKET_NAME")),
//		Key:                  aws.String(objectKey),
//		ACL:                  aws.String("public-read"),
//		Body:                 bytes.NewReader(buffer),
//		ContentLength:        aws.Int64(int64(size)),
//		ContentType:          aws.String(http.DetectContentType(buffer)),
//		ContentDisposition:   aws.String("attachment"),
//		//ServerSideEncryption: aws.String("AES256"),
//	})
//	if err != nil {
//		return "", err
//	}
//	return objectKey, err
//}