package services

import (
	m "uds-online/api/models"
)

type lessonService struct {
	TableName string
}

func (s *lessonService) Get(id uint) (*m.Lesson, error) {
	o := &m.Lesson{}
	err := m.GetDB().
		Preload("Content").
		Preload("Content.Tasks").
		Take(o, "id = ?", id).
		Error
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (s *lessonService) Create(model *m.Lesson) error {
	if err := m.GetDB().Create(model).Error; err != nil {
		return err
	}
	return nil
}

func (s *lessonService) Update(model *m.Lesson) error {
	if err := m.GetDB().Save(model).Error; err != nil {
		return err
	}
	return nil
}


var LessonService = lessonService{TableName: "lessons"}