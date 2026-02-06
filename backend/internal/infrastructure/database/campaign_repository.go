package database

import (
	"context"
	"database/sql"
	"encoding/json"

	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/domain/repositories"
)

type campaignRepositoryImpl struct {
	db *sql.DB
}

func NewCampaignRepository(db *sql.DB) repositories.CampaignRepository {
	return &campaignRepositoryImpl{db: db}
}

func (r *campaignRepositoryImpl) Create(ctx context.Context, campaign *entities.Campaign) error {
	configJSON, err := json.Marshal(campaign.Config)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO campaigns (
			id, name, survey_open_date, survey_close_date,
			profile_update_start_date, profile_update_end_date,
			results_release_date, is_active, algorithm_version,
			total_participants, total_matches_generated, config,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

	_, err = r.db.ExecContext(ctx, query,
		campaign.ID,
		campaign.Name,
		campaign.SurveyOpenDate,
		campaign.SurveyCloseDate,
		campaign.ProfileUpdateStartDate,
		campaign.ProfileUpdateEndDate,
		campaign.ResultsReleaseDate,
		campaign.IsActive,
		campaign.AlgorithmVersion,
		campaign.TotalParticipants,
		campaign.TotalMatchesGenerated,
		configJSON,
		campaign.CreatedAt,
		campaign.UpdatedAt,
	)

	return err
}

func (r *campaignRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Campaign, error) {
	query := `
		SELECT id, name, survey_open_date, survey_close_date,
		       profile_update_start_date, profile_update_end_date,
		       results_release_date, is_active, algorithm_version,
		       total_participants, total_matches_generated,
		       config, created_at, updated_at
		FROM campaigns
		WHERE id = $1
	`

	var campaign entities.Campaign
	var configJSON []byte

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&campaign.ID,
		&campaign.Name,
		&campaign.SurveyOpenDate,
		&campaign.SurveyCloseDate,
		&campaign.ProfileUpdateStartDate,
		&campaign.ProfileUpdateEndDate,
		&campaign.ResultsReleaseDate,
		&campaign.IsActive,
		&campaign.AlgorithmVersion,
		&campaign.TotalParticipants,
		&campaign.TotalMatchesGenerated,
		&configJSON,
		&campaign.CreatedAt,
		&campaign.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	if configJSON != nil {
		err = json.Unmarshal(configJSON, &campaign.Config)
	}

	return &campaign, err
}

func (r *campaignRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Campaign, error) {
	query := `
		SELECT id, name, survey_open_date, survey_close_date,
		       profile_update_start_date, profile_update_end_date,
		       results_release_date, is_active, algorithm_version,
		       total_participants, total_matches_generated,
		       config, created_at, updated_at
		FROM campaigns
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var campaigns []*entities.Campaign

	for rows.Next() {
		var campaign entities.Campaign
		var configJSON []byte

		err := rows.Scan(
			&campaign.ID,
			&campaign.Name,
			&campaign.SurveyOpenDate,
			&campaign.SurveyCloseDate,
			&campaign.ProfileUpdateStartDate,
			&campaign.ProfileUpdateEndDate,
			&campaign.ResultsReleaseDate,
			&campaign.IsActive,
			&campaign.AlgorithmVersion,
			&campaign.TotalParticipants,
			&campaign.TotalMatchesGenerated,
			&configJSON,
			&campaign.CreatedAt,
			&campaign.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		if configJSON != nil {
			err = json.Unmarshal(configJSON, &campaign.Config)
			if err != nil {
				return nil, err
			}
		}

		campaigns = append(campaigns, &campaign)
	}

	return campaigns, nil
}

func (r *campaignRepositoryImpl) Update(ctx context.Context, campaign *entities.Campaign) error {
	configJSON, err := json.Marshal(campaign.Config)
	if err != nil {
		return err
	}

	query := `
		UPDATE campaigns
		SET name = $2,
		    survey_open_date = $3,
		    survey_close_date = $4,
		    profile_update_start_date = $5,
		    profile_update_end_date = $6,
		    results_release_date = $7,
		    is_active = $8,
		    algorithm_version = $9,
		    total_participants = $10,
		    total_matches_generated = $11,
		    config = $12,
		    updated_at = $13
		WHERE id = $1
	`

	_, err = r.db.ExecContext(ctx, query,
		campaign.ID,
		campaign.Name,
		campaign.SurveyOpenDate,
		campaign.SurveyCloseDate,
		campaign.ProfileUpdateStartDate,
		campaign.ProfileUpdateEndDate,
		campaign.ResultsReleaseDate,
		campaign.IsActive,
		campaign.AlgorithmVersion,
		campaign.TotalParticipants,
		campaign.TotalMatchesGenerated,
		configJSON,
		campaign.UpdatedAt,
	)

	return err
}

func (r *campaignRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM campaigns WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
