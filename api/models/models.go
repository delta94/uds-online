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
		&Lesson{},
		&LessonContent{},
		&LessonTask{},
		&Course{},
	)
	// Foreign Keys
	db.Model(&Password{}).AddForeignKey("account_id", "accounts(id)", "CASCADE", "NO ACTION")
	db.Model(&Token{}).AddForeignKey("account_id", "accounts(id)", "CASCADE", "NO ACTION")
	db.Model(&LessonContent{}).AddForeignKey("lesson_id", "lessons(id)", "CASCADE", "NO ACTION")
	db.Model(&LessonTask{}).AddForeignKey("lesson_content_id", "lesson_contents(id)", "CASCADE", "NO ACTION")
	db.Model(&Course{}).AddForeignKey("assistant_id", "accounts(id)", "SET NULL", "NO ACTION")

	//v4, _ := uuid.NewV4()
	//lessons := []*Lesson{
	//	&Lesson{Title: "lesson 1", Annotation: "ann for 1"},
	//	&Lesson{Title: "lesson 2", Annotation: "ann for 2"},
	//}
	//courses := []*Course{&Course{Title: "A course for beginners", Annotation: "Wow!", Price: 1000, Lessons: lessons}}
	//
	//acc := &Account{ID: v4}
	//acc.Role = 1
	//acc.Email = "sfsd@rwh.ytk"
	//
	//err = GetDB().Save(acc).Error
	//if err != nil {
	//	fmt.Println("Error", err)
	//}
	//acc.AssignedCourses = courses
	//GetDB().Save(acc)
}

func GetDB() *gorm.DB {
	return db
}
