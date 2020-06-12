package services

import (
	"fmt"
	m "uds-online/api/models"
)

type courseService struct {
	TableName string
}

func (s *courseService) Create(model *m.Course) error {
	if err := model.Validate(); err != nil {
		return err
	}
	if err := m.GetDB().Create(model).Error; err != nil {
		return fmt.Errorf("could not create course")
	}
	if model.ID == 0 {
		return fmt.Errorf("failed to create course, connection error")
	}
	return nil
}


var CourseService = courseService{TableName: "courses"}
