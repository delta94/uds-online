package services

import (
	"fmt"
	"time"
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
		return err
	}
	if model.ID == 0 {
		return fmt.Errorf("failed to create course, connection error")
	}
	return nil
}

func (s *courseService) Update(model *m.Course) error {
	err := m.GetDB().Save(model).Error
	if err != nil {
		return err
	}
	return nil
}

func (s *courseService) Find(offset int, limit int) ([]*m.Course, uint, error) {
	var total uint = 0
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
		return nil, 0, query.Error
	}
	if query.Error != nil {
		return objs, 0, nil
	}
	return objs, total, nil
}

func (s *courseService) GetForAdmin(id uint) (*m.Course, error) {
	o := &m.Course{}
	err := m.GetDB().
		Table(s.TableName).
		Preload("Lessons").
		Take(o, "id = ?", id).
		Error
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (s *courseService) FindAllForAdmin() ([]*m.Course, error) {
	objs := make([]*m.Course, 0)
	query := m.GetDB().
		Order("published desc, created_at desc").
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

func (s *courseService) Copy(id uint) (*m.Course, error) {
	o := &m.Course{}
	err := m.GetDB().
		Table(s.TableName).
		Preload("Lessons").
		Preload("Lessons.Content").
		Preload("Lessons.Content.Tasks").
		Take(o, "id = ?", id).
		Error
	if err != nil {
		return nil, err
	}
	o.ID = 0
	o.CreatedAt = time.Now()
	o.UpdatedAt = time.Now()
	o.Published = false
	for _, l := range o.Lessons {
		l.ID  = 0
		l.CreatedAt = time.Now()
		l.UpdatedAt = time.Now()
		l.CourseID = 0
		l.Content.ID = 0
		l.Content.LessonID = 0
		for _, t := range l.Content.Tasks {
			t.ID = 0
			t.LessonContentID = 0
			t.CreatedAt = time.Now()
			t.UpdatedAt = time.Now()
		}
	}
	err = m.GetDB().Save(o).Error
	if err != nil {
		return nil, err
	}
	return o, nil
}


var CourseService = courseService{TableName: "courses"}
