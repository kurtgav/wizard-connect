package database

import (
	"context"

	"wizard-connect/internal/domain/repositories"
)

type AdminRepository struct {
	db *Database
}

func NewAdminRepository(db *Database) repositories.AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) IsAdmin(ctx context.Context, userID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM admin_users 
			WHERE user_id = $1
		)
	`

	var isAdmin bool
	err := r.db.QueryRow(ctx, query, userID).Scan(&isAdmin)
	if err != nil {
		return false, err
	}

	return isAdmin, nil
}

func (r *AdminRepository) AddAdmin(ctx context.Context, email string) error {
	query := `
		SELECT public.add_admin($1)
	`

	_, err := r.db.Exec(ctx, query, email)
	return err
}

func (r *AdminRepository) RemoveAdmin(ctx context.Context, email string) error {
	query := `
		SELECT public.remove_admin($1)
	`

	_, err := r.db.Exec(ctx, query, email)
	return err
}

func (r *AdminRepository) ListAdmins(ctx context.Context) ([]string, error) {
	query := `
		SELECT email FROM admin_users ORDER BY created_at
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var emails []string
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			return nil, err
		}
		emails = append(emails, email)
	}

	return emails, nil
}
