package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"wizard-connect/internal/domain/entities"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type SurveyRepository struct {
	db *Database
}

func NewSurveyRepository(db *Database) *SurveyRepository {
	return &SurveyRepository{db: db}
}

func (r *SurveyRepository) CreateOrUpdate(ctx context.Context, survey *entities.SurveyResponse) error {
	// Generate UUID if not provided
	if survey.ID == "" {
		survey.ID = uuid.New().String()
	}

	responsesJSON, err := json.Marshal(survey.Responses)
	if err != nil {
		return fmt.Errorf("failed to marshal responses: %w", err)
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
		pq.Array(survey.Interests), pq.Array(survey.Values), survey.Lifestyle, survey.IsComplete,
		survey.CompletedAt, survey.CreatedAt, survey.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to execute survey insert/update: %w", err)
	}

	return nil
}

func (r *SurveyRepository) GetByUserID(ctx context.Context, userID string) (*entities.SurveyResponse, error) {
	query := `
		SELECT id, user_id, responses, personality_type, interests, values, lifestyle,
		       is_complete, completed_at, created_at, updated_at
		FROM surveys
		WHERE user_id = $1
	`

	var responsesJSON []byte

	survey := &entities.SurveyResponse{}
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&survey.ID, &survey.UserID, &responsesJSON, &survey.PersonalityType,
		pq.Array(&survey.Interests), pq.Array(&survey.Values), &survey.Lifestyle, &survey.IsComplete,
		&survey.CompletedAt, &survey.CreatedAt, &survey.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Unmarshal JSON responses
	json.Unmarshal(responsesJSON, &survey.Responses)

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

		survey := &entities.SurveyResponse{}
		err := rows.Scan(
			&survey.ID, &survey.UserID, &responsesJSON, &survey.PersonalityType,
			pq.Array(&survey.Interests), pq.Array(&survey.Values), &survey.Lifestyle, &survey.IsComplete,
			&survey.CompletedAt, &survey.CreatedAt, &survey.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Unmarshal JSON responses
		json.Unmarshal(responsesJSON, &survey.Responses)

		surveys = append(surveys, survey)
	}

	return surveys, nil
}
