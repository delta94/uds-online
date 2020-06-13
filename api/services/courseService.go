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

func (s *courseService) Find(offset int, limit int) (data []*m.Course, total uint) {
	objs := make([]*m.Course, 0)
	query := m.GetDB().
		Order("created_at desc").
		Table(s.TableName).
		Where("published = ?", true).
		Count(&total).
		Limit(limit).
		Offset(offset * limit).
		Find(&objs)
	if query.Error != nil && !query.RecordNotFound() {
		return nil, 0
	}
	if query.Error != nil {
		return nil, 0
	}
	return objs, total
}

func (s *courseService) FindAll() ([]*m.Course, error) {
	objs := make([]*m.Course, 0)
	query := m.GetDB().
		Order("created_at desc").
		Table(s.TableName).
		Find(&objs)
	if query.Error != nil && !query.RecordNotFound() {
		return objs, nil
	}
	if query.Error != nil {
		return nil, query.Error
	}
	return objs, nil
}

var CourseService = courseService{TableName: "courses"}
