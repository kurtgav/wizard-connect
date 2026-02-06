package database

import (
	"context"
	"wizard-connect/internal/domain/entities"
)

type MatchRepository struct {
	db *Database
}

func NewMatchRepository(db *Database) *MatchRepository {
	return &MatchRepository{db: db}
}

func (r *MatchRepository) Create(ctx context.Context, match *entities.Match) error {
	query := `
		INSERT INTO matches (user_id, matched_user_id, compatibility_score, rank, is_mutual_crush)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(ctx, query,
		match.UserID, match.MatchedUserID, match.CompatibilityScore,
		match.Rank, match.IsMutualCrush,
	)

	return err
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
			&match.ID, &match.UserID, &match.MatchedUserID,
			&match.CompatibilityScore, &match.Rank, &match.IsMutualCrush,
			&match.CreatedAt,
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
		&match.ID, &match.UserID, &match.MatchedUserID,
		&match.CompatibilityScore, &match.Rank, &match.IsMutualCrush,
		&match.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return match, nil
}

func (r *MatchRepository) DeleteByUserID(ctx context.Context, userID string) error {
	query := `DELETE FROM matches WHERE user_id = $1`
	_, err := r.db.Exec(ctx, query, userID)
	return err
}
