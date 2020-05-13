package services

import "github.com/jinzhu/gorm"

type Service interface {
	Create(gorm.Model) error
	Get(uint) *gorm.Model
	Find(offset int, limit int) (data *gorm.Model, total uint)
	Update(id uint, model gorm.Model) (updated *gorm.Model, err error)
	Delete(id uint) error
}
