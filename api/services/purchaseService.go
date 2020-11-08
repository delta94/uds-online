package services

import (
	m "uds-online/api/models"
)

type purchaseService struct {
	TableName string
}

func (s *purchaseService) Create(model *m.Purchase) error {
	if err := model.Validate(); err != nil {
		return err
	}
	if err := m.GetDB().Create(model).Error; err != nil {
		return err
	}
	return nil
}

func (s *purchaseService) Find(offset int, limit int) ([]*m.Purchase, uint, error) {
	var total uint = 0
	objs := make([]*m.Purchase, 0)
	query := m.GetDB().
		Order("created_at desc").
		Table(s.TableName).
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

func (s *purchaseService) Delete(id string) error {
	err := m.GetDB().Unscoped().Delete(&m.Purchase{}, "id = ?", id).Error
	if err != nil {
		return err
	}
	return nil
}

var PurchaseService = purchaseService{TableName: "purchases"}
