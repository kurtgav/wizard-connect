package entities

import "time"

type Campaign struct {
	ID                     string                 `json:"id"`
	Name                   string                 `json:"name"`
	SurveyOpenDate         time.Time              `json:"survey_open_date"`
	SurveyCloseDate        time.Time              `json:"survey_close_date"`
	ProfileUpdateStartDate *time.Time             `json:"profile_update_start_date,omitempty"`
	ProfileUpdateEndDate   *time.Time             `json:"profile_update_end_date,omitempty"`
	ResultsReleaseDate     time.Time              `json:"results_release_date"`
	IsActive               bool                   `json:"is_active"`
	TotalParticipants      int                    `json:"total_participants"`
	TotalMatchesGenerated  int                    `json:"total_matches_generated"`
	AlgorithmVersion       string                 `json:"algorithm_version"`
	Config                 map[string]interface{} `json:"config,omitempty"`
	CreatedAt              time.Time              `json:"created_at"`
	UpdatedAt              time.Time              `json:"updated_at"`
}
