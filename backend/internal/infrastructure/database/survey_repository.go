package database

import (
	"context"
	"database/sql"
	"encoding/json"

	"wizard-connect/internal/domain/entities"
)

type SurveyRepository struct {
	db *Database
}

func NewSurveyRepository(db *Database) *SurveyRepository {
	return &SurveyRepository{db: db}
}

func (r *SurveyRepository) CreateOrUpdate(ctx context.Context, survey *entities.SurveyResponse) error {
	responsesJSON, err := json.Marshal(survey.Responses)
	if err != nil {
		return err
	}

	interestsArray, err := json.Marshal(survey.Interests)
	if err != nil {
		return err
	}

	valuesArray, err := json.Marshal(survey.Values)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO surveys (id, user_id, responses, personality_type, interests, values, lifestyle, is_complete, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (user_id) DO UPDATE
		SET responses = EXCLUDED.responses,
		    personality_type = EXCLUDED.personality_type,
		    interests = EXCLUDED.interests,
		    values = EXCLUDED.values,
		    lifestyle = EXCLUDED.lifestyle,
		    is_complete = EXCLUDED.is_complete,
		    completed_at = EXCLUDED.completed_at,
		    updated_at = NOW()
	`

	_, err = r.db.Exec(ctx, query,
		survey.ID, survey.UserID, responsesJSON, survey.PersonalityType,
		interestsArray, valuesArray, survey.Lifestyle, survey.IsComplete,
		survey.CompletedAt, survey.CreatedAt,
	)

	return err
}

func (r *SurveyRepository) GetByUserID(ctx context.Context, userID string) (*entities.SurveyResponse, error) {
	query := `
		SELECT id, user_id, responses, personality_type, interests, values, lifestyle,
		       is_complete, completed_at, created_at, updated_at
		FROM surveys
		WHERE user_id = $1
	`

	var responsesJSON []byte
	var interestsJSON []byte
	var valuesJSON []byte

	survey := &entities.SurveyResponse{}
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&survey.ID, &survey.UserID, &responsesJSON, &survey.PersonalityType,
		&interestsJSON, &valuesJSON, &survey.Lifestyle, &survey.IsComplete,
		&survey.CompletedAt, &survey.CreatedAt, &survey.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Unmarshal JSON fields
	json.Unmarshal(responsesJSON, &survey.Responses)
	json.Unmarshal(interestsJSON, &survey.Interests)
	json.Unmarshal(valuesJSON, &survey.Values)

	return survey, nil
}

func (r *SurveyRepository) GetCompletedSurveys(ctx context.Context) ([]*entities.SurveyResponse, error) {
	query := `
		SELECT id, user_id, responses, personality_type, interests, values, lifestyle,
		       is_complete, completed_at, created_at, updated_at
		FROM surveys
		WHERE is_complete = true
		ORDER BY completed_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var surveys []*entities.SurveyResponse
	for rows.Next() {
		var responsesJSON []byte
		var interestsJSON []byte
		var valuesJSON []byte

		survey := &entities.SurveyResponse{}
		err := rows.Scan(
			&survey.ID, &survey.UserID, &responsesJSON, &survey.PersonalityType,
			&interestsJSON, &valuesJSON, &survey.Lifestyle, &survey.IsComplete,
			&survey.CompletedAt, &survey.CreatedAt, &survey.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Unmarshal JSON fields
		json.Unmarshal(responsesJSON, &survey.Responses)
		json.Unmarshal(interestsJSON, &survey.Interests)
		json.Unmarshal(valuesJSON, &survey.Values)

		surveys = append(surveys, survey)
	}

	return surveys, nil
}
