package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
)

// GetActiveCampaign retrieves the currently active campaign
func GetActiveCampaign(ctx context.Context, db *sql.DB) (*ActiveCampaign, error) {
	query := `
		SELECT id, name, survey_open_date, survey_close_date,
		       profile_update_start_date, profile_update_end_date,
		       results_release_date, config
		FROM campaigns
		WHERE is_active = TRUE
		ORDER BY created_at DESC
		LIMIT 1
	`

	var campaign ActiveCampaign
	var configJSON []byte
	var profileUpdateStartDate, profileUpdateEndDate *time.Time

	err := db.QueryRowContext(ctx, query).Scan(
		&campaign.ID,
		&campaign.Name,
		&campaign.SurveyOpenDate,
		&campaign.SurveyCloseDate,
		&profileUpdateStartDate,
		&profileUpdateEndDate,
		&campaign.ResultsReleaseDate,
		&configJSON,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No active campaign
		}
		return nil, err
	}

	campaign.ProfileUpdateStartDate = profileUpdateStartDate
	campaign.ProfileUpdateEndDate = profileUpdateEndDate

	if configJSON != nil {
		if err := campaign.Config.UnmarshalJSON(configJSON); err != nil {
			return nil, err
		}
	}

	return &campaign, nil
}

type ActiveCampaign struct {
	ID                     string         `json:"id"`
	Name                   string         `json:"name"`
	SurveyOpenDate         time.Time      `json:"survey_open_date"`
	SurveyCloseDate        time.Time      `json:"survey_close_date"`
	ProfileUpdateStartDate *time.Time     `json:"profile_update_start_date"`
	ProfileUpdateEndDate   *time.Time     `json:"profile_update_end_date"`
	ResultsReleaseDate     time.Time      `json:"results_release_date"`
	Config                 CampaignConfig `json:"config"`
}

type CampaignConfig struct {
	Weights                   map[string]float64 `json:"weights"`
	NumMatches                int                `json:"num_matches"`
	MutualCrushBonus          float64            `json:"mutual_crush_bonus"`
	OneWayCrushBonus          float64            `json:"one_way_crush_bonus"`
	MinimumCompatibilityScore float64            `json:"minimum_compatibility_score"`
}

func (c *CampaignConfig) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, c)
}
