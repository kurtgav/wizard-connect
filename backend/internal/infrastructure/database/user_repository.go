package database

import (
	"context"
	"fmt"

	"wizard-connect/internal/domain/entities"
)

type UserRepository struct {
	db *Database
}

func NewUserRepository(db *Database) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *entities.User) error {
	query := `
		INSERT INTO users (id, email, first_name, last_name, avatar_url, bio, instagram, phone, contact_preference, visibility, year, major)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE
		SET email = EXCLUDED.email,
		    first_name = EXCLUDED.first_name,
		    last_name = EXCLUDED.last_name,
		    avatar_url = EXCLUDED.avatar_url,
		    bio = EXCLUDED.bio,
		    instagram = EXCLUDED.instagram,
		    phone = EXCLUDED.phone,
		    contact_preference = EXCLUDED.contact_preference,
		    visibility = EXCLUDED.visibility,
		    year = EXCLUDED.year,
		    major = EXCLUDED.major,
		    updated_at = NOW()
	`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.Email, user.FirstName, user.LastName, user.AvatarURL,
		user.Bio, user.Instagram, user.Phone, user.ContactPref, user.Visibility,
		user.Year, user.Major,
	)

	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entities.User, error) {
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &entities.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.AvatarURL,
		&user.Bio, &user.Instagram, &user.Phone, &user.ContactPref, &user.Visibility,
		&user.Year, &user.Major, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &entities.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.AvatarURL,
		&user.Bio, &user.Instagram, &user.Phone, &user.ContactPref, &user.Visibility,
		&user.Year, &user.Major, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	query := `
		UPDATE users
		SET first_name = $2, last_name = $3, avatar_url = $4, bio = $5,
		    instagram = $6, phone = $7, contact_preference = $8,
		    visibility = $9, year = $10, major = $11, updated_at = NOW()
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.FirstName, user.LastName, user.AvatarURL, user.Bio,
		user.Instagram, user.Phone, user.ContactPref, user.Visibility,
		user.Year, user.Major,
	)

	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *UserRepository) List(ctx context.Context, limit, offset int) ([]*entities.User, error) {
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		user := &entities.User{}
		err := rows.Scan(
			&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.AvatarURL,
			&user.Bio, &user.Instagram, &user.Phone, &user.ContactPref, &user.Visibility,
			&user.Year, &user.Major, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}
