package database

import (
	"context"
	"wizard-connect/internal/domain/entities"
)

type CrushRepository struct {
	db *Database
}

func NewCrushRepository(db *Database) *CrushRepository {
	return &CrushRepository{db: db}
}

func (r *CrushRepository) Create(ctx context.Context, crush *entities.Crush) error {
	query := `
		INSERT INTO crushes (id, user_id, crush_email, rank)
		VALUES ($1, $2, $3, $4)
	`

	_, err := r.db.Exec(ctx, query,
		crush.ID, crush.UserID, crush.CrushEmail, crush.Rank,
	)

	return err
}

func (r *CrushRepository) GetByUserID(ctx context.Context, userID string) ([]*entities.Crush, error) {
	query := `
		SELECT id, user_id, crush_email, rank, created_at
		FROM crushes
		WHERE user_id = $1
		ORDER BY rank ASC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var crushes []*entities.Crush
	for rows.Next() {
		crush := &entities.Crush{}
		err := rows.Scan(
			&crush.ID, &crush.UserID, &crush.CrushEmail,
			&crush.Rank, &crush.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		crushes = append(crushes, crush)
	}

	return crushes, nil
}

func (r *CrushRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM crushes WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
