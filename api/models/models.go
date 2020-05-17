package models

import (
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"log"
	"os"
	u "uds-online/api/utils"
)

var db *gorm.DB

func init() {
	u.LoadEnv()

	username := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	//dbPort := os.Getenv("DB_PORT")

	log.Printf("Using Database: %s\n", dbName)
	// Build connection string
	dbString := fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8&parseTime=True", username, password, dbHost, dbName)
	conn, err := gorm.Open("mysql", dbString)
	if err != nil {
		log.Println(err)
	}
	db = conn
	if os.Getenv("IS_PRODUCTION") == "" {
		db.LogMode(true)
	}
	// Migrate
	db.Debug().AutoMigrate(
		&Account{},
		&Password{},
		&Token{},
		&Course{},
		&CourseContent{},
		&CourseTask{},
	)
	// Foreign Keys
	db.Model(&Password{}).AddForeignKey("account_id", "accounts(id)", "CASCADE", "NO ACTION")
	db.Model(&Token{}).AddForeignKey("account_id", "accounts(id)", "CASCADE", "NO ACTION")
	db.Model(&CourseContent{}).AddForeignKey("course_id", "courses(id)", "CASCADE", "NO ACTION")
	db.Model(&CourseTask{}).AddForeignKey("course_content_id", "course_contents(id)", "CASCADE", "NO ACTION")

}

func GetDB() *gorm.DB {
	return db
}