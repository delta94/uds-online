package services

import (
	"fmt"
	m "uds-online/api/models"
)

type uploadService struct {
	TableName string
}

func (us *uploadService) Create(model *m.Upload) error {
	if err := model.Validate(); err != nil {
		return err
	}
	if err := m.GetDB().Create(model).Error; err != nil {
		return err
	}
	if model.ID == 0 {
		return fmt.Errorf("failed to create upload, connection error")
	}
	return nil
}

func (us *uploadService) Get(id uint) (*m.Upload, error) {
	upload := &m.Upload{}
	err := m.GetDB().Take(upload, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return upload, nil
}

func (us *uploadService) Find(offset int, limit int) ([]*m.Upload, uint, error) {
	var total uint = 0
	objs := make([]*m.Upload, 0)
	query := m.GetDB().
		Order("created_at desc").
		Table(us.TableName).
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

func (us *uploadService) Delete(id uint) error {
	o := &m.Upload{}
	err := m.GetDB().Unscoped().Delete(o, "id = ?", id).Error
	if err != nil {
		return err
	}
	return nil
}

var UploadService = uploadService{TableName: "uploads"}
