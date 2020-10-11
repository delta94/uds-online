package services

import (
	"fmt"
	"github.com/google/uuid"
	m "uds-online/api/models"
)

type lessonService struct {
	TableName string
}

func (s *lessonService) Get(id uint) (error, *m.Lesson) {
	o := &m.Lesson{}
	err := m.GetDB().
		Preload("Content").
		Preload("Content.Tasks").
		Take(o, "id = ?", id).
		Error
	if err != nil {
		return err, nil
	}
	return nil, o
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

func (s *lessonService) GetTaskAnswers(accountId string, lessonId uint) (error, []*m.LessonAnswer) {
	lesson := &m.Lesson{}
	answers := make([]*m.LessonAnswer, 0)
	err := m.GetDB().
		Unscoped().
		Preload("Content").
		Preload("Content.Tasks").
		Take(lesson, "id = ?", lessonId).
		Error
	if err != nil {
		return err, nil
	}

	tIds := make([]uint, 0)

	for _, t := range lesson.Content.Tasks {
		tIds = append(tIds, t.ID)
	}
	if len(tIds) == 0 {
		return nil, answers
	}
	query := m.GetDB().
		Unscoped().
		Where("account_id = ? AND lesson_task_id IN (?)", accountId, tIds).Find(&answers)
	if query.Error != nil && !query.RecordNotFound() {
		return fmt.Errorf("could not find answers"), nil
	}
	return nil, answers
}

func (s *lessonService) ResetAnswers(accountId string, courseId int, lessonId int) error {
	answers := make([]*m.LessonAnswer, 0)
	query := m.GetDB().Raw(`
		SELECT * FROM lesson_answers AS la
		INNER JOIN lesson_tasks AS lt ON lt.id = la.lesson_task_id AND la.account_id = ?
		INNER JOIN lesson_contents AS lc ON lc.id = lt.lesson_content_id
		INNER JOIN lessons AS l ON l.id = lc.lesson_id AND l.id = ?
	`, accountId, lessonId)

	if query.Error != nil {
		return query.Error
	}

	query = query.Scan(&answers)
	if query.Error != nil {
		return query.Error
	}
	if len(answers) > 0 {

		ids := make([]uint, 0)
		for _, a := range answers {
			ids = append(ids, a.ID)
		}
		query = m.GetDB().Exec(`
			DELETE FROM lesson_answers
			WHERE id IN (?)
		`, ids)

		if query.Error != nil {
			return query.Error
		}
	}
	return nil
}

func (s *lessonService) SaveTaskAnswer(accountId string, courseId int, lessonId int, taskId uint, json string) error {
	purchase := &m.Purchase{}
	lesson := &m.Lesson{}
	query := m.GetDB().Take(lesson, "id = ?", lessonId)
	if query.Error != nil {
		return fmt.Errorf("cannot fetch lesson")
	}

	if lesson.Paid {
		err := m.GetDB().Take(purchase, "account_id = ? AND course_id = ?", accountId, courseId)

		if err != nil && err.RecordNotFound() {
			return fmt.Errorf("course not purchased")
		}
		if err.Error != nil {
			return fmt.Errorf("cannot check purchases")
		}
	}

	var uid, _err = uuid.Parse(accountId)
	if _err != nil {
		return fmt.Errorf("cannot parse UUID")
	}
	la := m.LessonAnswer{
		Json:         json,
		LessonTaskID: taskId,
		AccountID:    uid,
	}
	query = m.GetDB().Model(&la).Where("lesson_task_id = ? AND account_id = ?", taskId, accountId).Updates(la)
	if query.Error != nil {
		return fmt.Errorf("cannot fetch answers")
	}
	if query.RowsAffected == 0 {
		fmt.Println("Answer not found, creating...")
		m.GetDB().Create(&la)
	}

	return nil
}

var LessonService = lessonService{TableName: "lessons"}
