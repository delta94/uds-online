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

func (s *courseService) Update(id uint, fields map[string]interface{}) error {
	query := m.GetDB().
		Table(s.TableName).
		Where("id = ?", id).
		Update(fields)

	err := query.Error
	if query.RowsAffected == 0 {
		return fmt.Errorf("no records updated")
	}
	if err != nil {
		return err
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


func (s *courseService) GetForAdmin(id uint) (*m.Course, error) {
	o := &m.Course{}
	err := m.GetDB().Table(s.TableName).Take(o, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (s *courseService) FindAllForAdmin() ([]*m.Course, error) {
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
