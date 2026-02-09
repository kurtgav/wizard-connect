package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/domain/repositories"
	"wizard-connect/internal/domain/services"
	"wizard-connect/internal/infrastructure/database"
)

type CampaignController struct {
	campaignRepo    repositories.CampaignRepository
	matchingService services.MatchingService
	surveyRepo      database.SurveyRepository
}

type CreateCampaignRequest struct {
	Name                   string                 `json:"name" binding:"required"`
	SurveyOpenDate         time.Time              `json:"survey_open_date" binding:"required"`
	SurveyCloseDate        time.Time              `json:"survey_close_date" binding:"required"`
	ProfileUpdateStartDate *time.Time             `json:"profile_update_start_date"`
	ProfileUpdateEndDate   *time.Time             `json:"profile_update_end_date"`
	ResultsReleaseDate     time.Time              `json:"results_release_date" binding:"required"`
	IsActive               bool                   `json:"is_active"`
	AlgorithmVersion       string                 `json:"algorithm_version"`
	Config                 map[string]interface{} `json:"config"`
}

type UpdateCampaignRequest struct {
	Name                   *string                `json:"name"`
	SurveyOpenDate         *time.Time             `json:"survey_open_date"`
	SurveyCloseDate        *time.Time             `json:"survey_close_date"`
	ProfileUpdateStartDate *time.Time             `json:"profile_update_start_date"`
	ProfileUpdateEndDate   *time.Time             `json:"profile_update_end_date"`
	ResultsReleaseDate     *time.Time             `json:"results_release_date"`
	IsActive               *bool                  `json:"is_active"`
	AlgorithmVersion       *string                `json:"algorithm_version"`
	Config                 map[string]interface{} `json:"config"`
}

func NewCampaignController(
	campaignRepo repositories.CampaignRepository,
	matchingService services.MatchingService,
	surveyRepo database.SurveyRepository,
) *CampaignController {
	return &CampaignController{
		campaignRepo:    campaignRepo,
		matchingService: matchingService,
		surveyRepo:      surveyRepo,
	}
}

// CreateCampaign creates a new campaign
func (c *CampaignController) CreateCampaign(ctx *gin.Context) {
	var req CreateCampaignRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	campaign := &entities.Campaign{
		ID:                     uuid.New().String(),
		Name:                   req.Name,
		SurveyOpenDate:         req.SurveyOpenDate,
		SurveyCloseDate:        req.SurveyCloseDate,
		ProfileUpdateStartDate: req.ProfileUpdateStartDate,
		ProfileUpdateEndDate:   req.ProfileUpdateEndDate,
		ResultsReleaseDate:     req.ResultsReleaseDate,
		IsActive:               req.IsActive,
		AlgorithmVersion:       req.AlgorithmVersion,
		TotalParticipants:      0,
		TotalMatchesGenerated:  0,
		CreatedAt:              time.Now(),
		UpdatedAt:              time.Now(),
		Config:                 req.Config,
	}

	if err := c.campaignRepo.Create(context.Background(), campaign); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, campaign)
}

// GetCampaigns returns all campaigns
func (c *CampaignController) GetCampaigns(ctx *gin.Context) {
	isActiveStr := ctx.Query("is_active")

	campaigns, err := c.campaignRepo.GetAll(context.Background())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if isActiveStr != "" {
		isActive, err := strconv.ParseBool(isActiveStr)
		if err == nil {
			var filtered []*entities.Campaign
			for _, campaign := range campaigns {
				if campaign.IsActive == isActive {
					filtered = append(filtered, campaign)
				}
			}
			campaigns = filtered
		}
	}

	ctx.JSON(http.StatusOK, campaigns)
}

// GetCampaignByID returns a specific campaign
func (c *CampaignController) GetCampaignByID(ctx *gin.Context) {
	id := ctx.Param("id")

	campaign, err := c.campaignRepo.GetByID(context.Background(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	ctx.JSON(http.StatusOK, campaign)
}

// UpdateCampaign updates a campaign
func (c *CampaignController) UpdateCampaign(ctx *gin.Context) {
	id := ctx.Param("id")

	existing, err := c.campaignRepo.GetByID(context.Background(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	var req UpdateCampaignRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.SurveyOpenDate != nil {
		existing.SurveyOpenDate = *req.SurveyOpenDate
	}
	if req.SurveyCloseDate != nil {
		existing.SurveyCloseDate = *req.SurveyCloseDate
	}
	if req.ProfileUpdateStartDate != nil {
		existing.ProfileUpdateStartDate = req.ProfileUpdateStartDate
	}
	if req.ProfileUpdateEndDate != nil {
		existing.ProfileUpdateEndDate = req.ProfileUpdateEndDate
	}
	if req.ResultsReleaseDate != nil {
		existing.ResultsReleaseDate = *req.ResultsReleaseDate
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}
	if req.AlgorithmVersion != nil {
		existing.AlgorithmVersion = *req.AlgorithmVersion
	}
	if req.Config != nil {
		existing.Config = req.Config
	}

	existing.UpdatedAt = time.Now()

	if err := c.campaignRepo.Update(context.Background(), existing); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, existing)
}

// DeleteCampaign deletes a campaign
func (c *CampaignController) DeleteCampaign(ctx *gin.Context) {
	id := ctx.Param("id")

	if err := c.campaignRepo.Delete(context.Background(), id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Campaign deleted successfully"})
}

// RunMatchingAlgorithm triggers the matching algorithm for all participants
func (c *CampaignController) RunMatchingAlgorithm(ctx *gin.Context) {
	// Get all completed surveys
	surveys, err := c.surveyRepo.GetCompletedSurveys(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants: " + err.Error()})
		return
	}

	totalParticipants := len(surveys)
	if totalParticipants == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No completed surveys found to match"})
		return
	}

	// For each user, generate and save matches
	go func() {
		// Use a background context as this might take time
		bgCtx := context.Background()
		for _, survey := range surveys {
			// Generate matches (top 7)
			matches, err := c.matchingService.GenerateMatches(bgCtx, survey.UserID, 7)
			if err != nil {
				continue
			}
			_ = matches // Persistent in GenerateMatches via repository
		}
	}()

	ctx.JSON(http.StatusAccepted, gin.H{
		"message":            "Matching algorithm started in background",
		"total_participants": totalParticipants,
		"status":             "processing",
	})
}

// GetCampaignStatistics returns statistics for a campaign
func (c *CampaignController) GetCampaignStatistics(ctx *gin.Context) {
	id := ctx.Param("id")

	campaign, err := c.campaignRepo.GetByID(context.Background(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	// TODO: Fetch actual statistics from database
	stats := gin.H{
		"campaign_id":           campaign.ID,
		"campaign_name":         campaign.Name,
		"total_participants":    campaign.TotalParticipants,
		"total_matches":         campaign.TotalMatchesGenerated,
		"average_compatibility": 0.0,
		"mutual_crush_rate":     0.0,
	}

	ctx.JSON(http.StatusOK, stats)
}

// GetCampaignStatus returns the current campaign status (public)
func (ctrl *CampaignController) GetCampaignStatus(c *gin.Context) {
	status, err := database.GetCampaignStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get campaign status"})
		return
	}

	c.JSON(http.StatusOK, status)
}
