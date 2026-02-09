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
		if err := json.Unmarshal(configJSON, &campaign.Config); err != nil {
			return nil, err
		}
	}

	return &campaign, nil
}

// Global DB instance for helper functions (should be initialized in main)
var GlobalDB *sql.DB

func IsSurveyOpen() bool {
	if GlobalDB == nil {
		return false
	}
	status, err := GetCampaignStatus()
	if err != nil {
		return false
	}
	return status.SurveyActive
}

func IsProfileUpdatePeriod() bool {
	if GlobalDB == nil {
		return false
	}
	status, err := GetCampaignStatus()
	if err != nil {
		return false
	}
	return status.ProfileUpdateActive
}

func IsMessagingPeriod() bool {
	if GlobalDB == nil {
		return false
	}
	status, err := GetCampaignStatus()
	if err != nil {
		return false
	}
	return status.MessagingActive
}

func IsResultsReleased() bool {
	if GlobalDB == nil {
		return false
	}
	status, err := GetCampaignStatus()
	if err != nil {
		return false
	}
	return status.ResultsReleased
}

type CampaignStatusResponse struct {
	CampaignID          string    `json:"campaign_id"`
	CampaignName        string    `json:"campaign_name"`
	SurveyActive        bool      `json:"survey_active"`
	ProfileUpdateActive bool      `json:"profile_update_active"`
	MessagingActive     bool      `json:"messaging_active"`
	ResultsReleased     bool      `json:"results_released"`
	SurveyCloseDate     time.Time `json:"survey_close_date"`
	ResultsReleaseDate  time.Time `json:"results_release_date"`
	ServerTime          time.Time `json:"server_time"`
}

func GetCampaignStatus() (*CampaignStatusResponse, error) {
	if GlobalDB == nil {
		return nil, sql.ErrConnDone
	}

	active, err := GetActiveCampaign(context.Background(), GlobalDB)
	if err != nil {
		return nil, err
	}

	if active == nil {
		return &CampaignStatusResponse{
			ServerTime: time.Now(),
		}, nil
	}

	now := time.Now()

	// Survey is active if current time is between open and close dates
	surveyActive := now.After(active.SurveyOpenDate) && now.Before(active.SurveyCloseDate)

	// Profile update is active during the specified window
	profileActive := false
	if active.ProfileUpdateStartDate != nil && active.ProfileUpdateEndDate != nil {
		profileActive = now.After(*active.ProfileUpdateStartDate) && now.Before(*active.ProfileUpdateEndDate)
	}

	// Messaging is active during the profile update window
	messagingActive := profileActive

	// Results are released after the release date
	resultsReleased := now.After(active.ResultsReleaseDate)

	return &CampaignStatusResponse{
		CampaignID:          active.ID,
		CampaignName:        active.Name,
		SurveyActive:        surveyActive,
		ProfileUpdateActive: profileActive,
		MessagingActive:     messagingActive,
		ResultsReleased:     resultsReleased,
		SurveyCloseDate:     active.SurveyCloseDate,
		ResultsReleaseDate:  active.ResultsReleaseDate,
		ServerTime:          now,
	}, nil
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
