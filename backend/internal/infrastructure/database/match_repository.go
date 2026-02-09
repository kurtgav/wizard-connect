package database

import (
	"context"
	"database/sql"
	"time"
	"wizard-connect/internal/domain/entities"
)

type MatchRepository struct {
	db *Database
}

func NewMatchRepository(db *Database) *MatchRepository {
	return &MatchRepository{db: db}
}

func (r *MatchRepository) GetDB() *sql.DB {
	return r.db.DB
}

func (r *MatchRepository) GetByUserID(ctx context.Context, userID string) ([]*entities.Match, error) {
	query := `
		SELECT id, user_id, matched_user_id, compatibility_score, rank, is_mutual_crush, created_at
		FROM matches
		WHERE user_id = $1
		ORDER BY rank ASC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []*entities.Match
	for rows.Next() {
		match := &entities.Match{}
		err := rows.Scan(
			&match.ID, &match.UserID, &match.MatchedUserID, &match.CompatibilityScore, &match.Rank, &match.IsMutualCrush, &match.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		matches = append(matches, match)
	}

	return matches, nil
}

func (r *MatchRepository) GetMatch(ctx context.Context, userID, matchedUserID string) (*entities.Match, error) {
	query := `
		SELECT id, user_id, matched_user_id, compatibility_score, rank, is_mutual_crush, created_at
		FROM matches
		WHERE user_id = $1 AND matched_user_id = $2
	`

	match := &entities.Match{}
	err := r.db.QueryRow(ctx, query, userID, matchedUserID).Scan(
		&match.ID, &match.UserID, &match.MatchedUserID, &match.CompatibilityScore, &match.Rank, &match.IsMutualCrush, &match.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return match, nil
}

func (r *MatchRepository) Create(ctx context.Context, match *entities.Match) error {
	query := `
		INSERT INTO matches (user_id, matched_user_id, compatibility_score, rank, is_mutual_crush)
			VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(ctx, query,
		match.UserID, match.MatchedUserID, match.CompatibilityScore, match.Rank, match.IsMutualCrush,
	)

	return err
}

func (r *MatchRepository) DeleteByUserID(ctx context.Context, userID string) error {
	query := `DELETE FROM matches WHERE user_id = $1`

	_, err := r.db.Exec(ctx, query, userID)
	return err
}

func (r *MatchRepository) GetByUserIDWithUserDetails(ctx context.Context, userID string) ([]*MatchWithUserDetails, error) {
	query := `
		SELECT 
			m.id,
			m.user_id,
			m.matched_user_id,
			m.compatibility_score,
			m.rank,
			m.is_mutual_crush,
			m.created_at,
			u.email as matched_email,
			u.first_name,
			u.last_name,
			u.avatar_url,
			u.bio,
			u.year,
			u.major,
			u.gender,
			u.gender_preference,
			u.visibility
		FROM matches m
		JOIN users u ON m.matched_user_id = u.id
		WHERE m.user_id = $1
		ORDER BY m.rank ASC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []*MatchWithUserDetails
	for rows.Next() {
		match := &MatchWithUserDetails{}
		err := rows.Scan(
			&match.ID, &match.UserID, &match.MatchedUserID, &match.CompatibilityScore, &match.Rank, &match.IsMutualCrush, &match.CreatedAt,
			&match.MatchedEmail, &match.FirstName, &match.LastName, &match.AvatarURL,
			&match.Bio, &match.Year, &match.Major,
			&match.Gender, &match.GenderPreference, &match.Visibility,
		)

		if err != nil {
			return nil, err
		}

		matches = append(matches, match)
	}

	return matches, nil
}

type MatchWithUserDetails struct {
	ID                 string    `json:"id"`
	UserID             string    `json:"user_id"`
	MatchedUserID      string    `json:"matched_user_id"`
	CompatibilityScore float64   `json:"compatibility_score"`
	Rank               int       `json:"rank"`
	IsMutualCrush      bool      `json:"is_mutual_crush"`
	CreatedAt          time.Time `json:"created_at"`
	MatchedEmail       string    `json:"matched_email"`
	FirstName          string    `json:"first_name"`
	LastName           string    `json:"last_name"`
	AvatarURL          string    `json:"avatar_url"`
	Bio                string    `json:"bio"`
	Year               string    `json:"year"`
	Major              string    `json:"major"`
	Gender             string    `json:"gender"`
	GenderPreference   string    `json:"gender_preference"`
	Visibility         string    `json:"visibility"`
}
