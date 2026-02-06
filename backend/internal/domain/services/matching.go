package services

import (
	"context"
	"errors"
	"math"
	"sort"

	"wizard-connect/internal/domain/entities"
)

//go:generate mockgen -source=matching.go -destination=../../mocks/matching_service_mock.go

// Repository interfaces needed by the service
type SurveyRepository interface {
	GetCompletedSurveys(ctx context.Context) ([]*entities.SurveyResponse, error)
}

type CrushRepository interface {
	GetByUserID(ctx context.Context, userID string) ([]*entities.Crush, error)
}

type MatchRepository interface {
	Create(ctx context.Context, match *entities.Match) error
}

// MatchingService handles compatibility calculations and match generation
type MatchingService interface {
	CalculateCompatibility(ctx context.Context, user1, user2 *entities.SurveyResponse) (float64, error)
	GenerateMatches(ctx context.Context, userID string, limit int) ([]*entities.Match, error)
}

type matchingService struct {
	surveyRepo  SurveyRepository
	crushRepo   CrushRepository
	matchRepo   MatchRepository
}

func NewMatchingService(
	surveyRepo SurveyRepository,
	crushRepo CrushRepository,
	matchRepo MatchRepository,
) MatchingService {
	return &matchingService{
		surveyRepo: surveyRepo,
		crushRepo:  crushRepo,
		matchRepo:  matchRepo,
	}
}

// CalculateCompatibility computes a compatibility score (0-100) between two users
func (s *matchingService) CalculateCompatibility(ctx context.Context, user1, user2 *entities.SurveyResponse) (float64, error) {
	score := 0.0
	weights := map[string]float64{
		"personality": 0.30,
		"interests":    0.25,
		"values":       0.25,
		"lifestyle":    0.10,
		"mutual_crush": 0.10,
	}

	// Personality compatibility (30%)
	personalityScore := s.calculatePersonalityMatch(user1.PersonalityType, user2.PersonalityType)
	score += personalityScore * weights["personality"]

	// Interests overlap (25%)
	interestsScore := s.calculateInterestsOverlap(user1.Interests, user2.Interests)
	score += interestsScore * weights["interests"]

	// Values alignment (25%)
	valuesScore := s.calculateValuesAlignment(user1.Values, user2.Values)
	score += valuesScore * weights["values"]

	// Lifestyle compatibility (10%)
	lifestyleScore := s.calculateLifestyleMatch(user1.Lifestyle, user2.Lifestyle)
	score += lifestyleScore * weights["lifestyle"]

	// Base score
	return math.Min(score, 100.0), nil
}

func (s *matchingService) calculatePersonalityMatch(type1, type2 string) float64 {
	// Simplified personality matching
	compatibleTypes := map[string][]string{
		"INTJ": {"INTJ", "INTP", "INFJ", "ENTJ"},
		"INTP": {"INTP", "INTJ", "ENTP", "INFP"},
		"INFJ": {"INFJ", "INTJ", "INFP", "ENFJ"},
		"INFP": {"INFP", "INFJ", "INTP", "ENFP"},
		"ENTJ": {"ENTJ", "INTJ", "ENTP", "ESTJ"},
		"ENTP": {"ENTP", "INTP", "ENTJ", "ESTP"},
		"ENFJ": {"ENFJ", "INFJ", "ENFP", "ESFJ"},
		"ENFP": {"ENFP", "INFP", "ENFJ", "ENTP"},
	}

	if types, ok := compatibleTypes[type1]; ok {
		for _, t := range types {
			if t == type2 {
				return 85.0
			}
		}
	}
	return 60.0
}

func (s *matchingService) calculateInterestsOverlap(interests1, interests2 []string) float64 {
	if len(interests1) == 0 || len(interests2) == 0 {
		return 50.0
	}

	interestMap := make(map[string]bool)
	for _, i := range interests1 {
		interestMap[i] = true
	}

	overlap := 0
	for _, i := range interests2 {
		if interestMap[i] {
			overlap++
		}
	}

	totalUnique := len(interestMap)
	if totalUnique == 0 {
		return 50.0
	}

	percentage := float64(overlap) / float64(totalUnique) * 100
	return math.Min(percentage+40, 100.0) // Base 40 + overlap percentage
}

func (s *matchingService) calculateValuesAlignment(values1, values2 []string) float64 {
	if len(values1) == 0 || len(values2) == 0 {
		return 50.0
	}

	valueMap := make(map[string]bool)
	for _, v := range values1 {
		valueMap[v] = true
	}

	match := 0
	for _, v := range values2 {
		if valueMap[v] {
			match++
		}
	}

	percentage := float64(match) / float64(len(values2)) * 100
	return math.Min(percentage+30, 100.0)
}

func (s *matchingService) calculateLifestyle(lifestyle1, lifestyle2 string) float64 {
	// Simplified lifestyle matching
	if lifestyle1 == lifestyle2 {
		return 90.0
	}
	return 60.0
}

func (s *matchingService) calculateLifestyleMatch(lifestyle1, lifestyle2 string) float64 {
	if lifestyle1 == lifestyle2 {
		return 90.0
	}
	return 60.0
}

// GenerateMatches creates matches for a user based on compatibility scores
func (s *matchingService) GenerateMatches(ctx context.Context, userID string, limit int) ([]*entities.Match, error) {
	// Get all completed surveys
	surveys, err := s.surveyRepo.GetCompletedSurveys(ctx)
	if err != nil {
		return nil, err
	}

	// Get user's survey
	var userSurvey *entities.SurveyResponse
	for _, survey := range surveys {
		if survey.UserID == userID {
			userSurvey = survey
			break
		}
	}

	if userSurvey == nil {
		return nil, ErrSurveyNotCompleted
	}

	// Get user's crushes
	crushes, err := s.crushRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Build crush email set for mutual crush detection
	crushEmails := make(map[string]bool)
	for _, crush := range crushes {
		crushEmails[crush.CrushEmail] = true
	}

	// Calculate compatibility with all other users
	type matchCandidate struct {
		userID      string
		score       float64
		isMutual    bool
	}
	var candidates []matchCandidate

	for _, survey := range surveys {
		if survey.UserID == userID {
			continue
		}

		score, err := s.CalculateCompatibility(ctx, userSurvey, survey)
		if err != nil {
			continue
		}

		// Check for mutual crush
		isMutual := false
		// This would need to query the other user's crushes

		candidates = append(candidates, matchCandidate{
			userID:   survey.UserID,
			score:    score,
			isMutual: isMutual,
		})
	}

	// Sort by compatibility score (descending)
	sort.Slice(candidates, func(i, j int) bool {
		// Mutual crushes get priority
		if candidates[i].isMutual && !candidates[j].isMutual {
			return true
		}
		if !candidates[i].isMutual && candidates[j].isMutual {
			return false
		}
		return candidates[i].score > candidates[j].score
	})

	// Create top N matches
	var matches []*entities.Match
	maxMatches := min(limit, len(candidates))
	for i := 0; i < maxMatches; i++ {
		matches = append(matches, &entities.Match{
			UserID:             userID,
			MatchedUserID:      candidates[i].userID,
			CompatibilityScore: candidates[i].score,
			Rank:               i + 1,
			IsMutualCrush:      candidates[i].isMutual,
		})
	}

	return matches, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Custom errors
var (
	ErrSurveyNotCompleted = errors.New("user has not completed survey")
	ErrNoMatchesFound     = errors.New("no matches found")
)
