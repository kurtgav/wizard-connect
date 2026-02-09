package database

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"wizard-connect/internal/domain/entities"
)

type UserRepository struct {
	db     *Database
	cache  map[string]*entities.User
	mu     sync.RWMutex
	ttl    time.Duration
	stopCh chan struct{}
}

func NewUserRepository(db *Database) *UserRepository {
	return &UserRepository{
		db:     db,
		cache:  make(map[string]*entities.User),
		mu:     sync.RWMutex{},
		ttl:    5 * time.Minute, // Cache entries for 5 minutes
		stopCh: make(chan struct{}),
	}
}

func (r *UserRepository) cacheCleanup() {
	ticker := time.NewTicker(r.ttl)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			r.mu.Lock()
			r.cache = make(map[string]*entities.User) // Clear cache
			r.mu.Unlock()
		case <-r.stopCh:
			return
		}
	}
}

func (r *UserRepository) Close() {
	close(r.stopCh)
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entities.User, error) {
	// Try cache first
	r.mu.RLock()
	if user, found := r.cache[id]; found {
		r.mu.RUnlock()
		return user, nil
	}
	r.mu.RUnlock()

	// Cache miss - query database
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, gender, gender_preference, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &entities.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.AvatarURL,
		&user.Bio, &user.Instagram, &user.Phone, &user.ContactPref, &user.Visibility,
		&user.Year, &user.Major, &user.Gender, &user.GenderPreference, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Update cache
	r.mu.Lock()
	r.cache[id] = user
	r.mu.Unlock()

	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, gender, gender_preference, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &entities.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.AvatarURL,
		&user.Bio, &user.Instagram, &user.Phone, &user.ContactPref, &user.Visibility,
		&user.Year, &user.Major, &user.Gender, &user.GenderPreference, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *entities.User) error {
	query := `
		INSERT INTO users (id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, gender, gender_preference, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
	`

	_, err := r.db.Exec(ctx, query,
		user.ID, user.Email, user.FirstName, user.LastName, user.AvatarURL,
		user.Bio, user.Instagram, user.Phone, user.ContactPref, user.Visibility,
		user.Year, user.Major, user.Gender, user.GenderPreference,
	)

	if err != nil {
		return err
	}

	// Invalidate cache
	r.mu.Lock()
	delete(r.cache, user.ID)
	r.mu.Unlock()

	return nil
}

func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	// Get current user from database first
	currentUser, err := r.GetByID(ctx, user.ID)
	if err != nil {
		// If user doesn't exist, create them
		return r.Create(ctx, user)
	}

	// Build update list - only include fields that have actually changed
	updates := []string{}
	args := []interface{}{user.ID}
	argIndex := 2

	fmt.Printf("DEBUG: Comparing current user with incoming update\n")

	if user.FirstName != "" && user.FirstName != currentUser.FirstName {
		updates = append(updates, fmt.Sprintf("first_name = $%d", argIndex))
		args = append(args, user.FirstName)
		argIndex++
		fmt.Printf("DEBUG: Will update first_name to: %s (was: %s)\n", user.FirstName, currentUser.FirstName)
	}
	if user.LastName != "" && user.LastName != currentUser.LastName {
		updates = append(updates, fmt.Sprintf("last_name = $%d", argIndex))
		args = append(args, user.LastName)
		argIndex++
		fmt.Printf("DEBUG: Will update last_name to: %s (was: %s)\n", user.LastName, currentUser.LastName)
	}
	if user.AvatarURL != "" && user.AvatarURL != currentUser.AvatarURL {
		updates = append(updates, fmt.Sprintf("avatar_url = $%d", argIndex))
		args = append(args, user.AvatarURL)
		argIndex++
		fmt.Printf("DEBUG: Will update avatar_url to: %s (was: %s)\n", user.AvatarURL, currentUser.AvatarURL)
	}
	if user.Bio != "" && user.Bio != currentUser.Bio {
		updates = append(updates, fmt.Sprintf("bio = $%d", argIndex))
		args = append(args, user.Bio)
		argIndex++
		fmt.Printf("DEBUG: Will update bio to: %s (was: %s)\n", user.Bio, currentUser.Bio)
	}
	if user.Instagram != "" && user.Instagram != currentUser.Instagram {
		updates = append(updates, fmt.Sprintf("instagram = $%d", argIndex))
		args = append(args, user.Instagram)
		argIndex++
		fmt.Printf("DEBUG: Will update instagram to: %s (was: %s)\n", user.Instagram, currentUser.Instagram)
	}
	if user.Phone != "" && user.Phone != currentUser.Phone {
		updates = append(updates, fmt.Sprintf("phone = $%d", argIndex))
		args = append(args, user.Phone)
		argIndex++
		fmt.Printf("DEBUG: Will update phone to: %s (was: %s)\n", user.Phone, currentUser.Phone)
	}
	if user.ContactPref != "" && user.ContactPref != currentUser.ContactPref {
		updates = append(updates, fmt.Sprintf("contact_preference = $%d", argIndex))
		args = append(args, user.ContactPref)
		argIndex++
		fmt.Printf("DEBUG: Will update contact_preference to: %s (was: %s)\n", user.ContactPref, currentUser.ContactPref)
	}
	if user.Visibility != "" && user.Visibility != currentUser.Visibility {
		updates = append(updates, fmt.Sprintf("visibility = $%d", argIndex))
		args = append(args, user.Visibility)
		argIndex++
		fmt.Printf("DEBUG: Will update visibility to: %s (was: %s)\n", user.Visibility, currentUser.Visibility)
	}
	if user.Year != "" && user.Year != currentUser.Year {
		updates = append(updates, fmt.Sprintf("year = $%d", argIndex))
		args = append(args, user.Year)
		argIndex++
		fmt.Printf("DEBUG: Will update year to: %s (was: %s)\n", user.Year, currentUser.Year)
	}
	if user.Major != "" && user.Major != currentUser.Major {
		updates = append(updates, fmt.Sprintf("major = $%d", argIndex))
		args = append(args, user.Major)
		argIndex++
		fmt.Printf("DEBUG: Will update major to: %s (was: %s)\n", user.Major, currentUser.Major)
	}
	if user.Gender != "" && user.Gender != currentUser.Gender {
		updates = append(updates, fmt.Sprintf("gender = $%d", argIndex))
		args = append(args, user.Gender)
		argIndex++
		fmt.Printf("DEBUG: Will update gender to: %s (was: %s)\n", user.Gender, currentUser.Gender)
	}
	if user.GenderPreference != "" && user.GenderPreference != currentUser.GenderPreference {
		updates = append(updates, fmt.Sprintf("gender_preference = $%d", argIndex))
		args = append(args, user.GenderPreference)
		argIndex++
		fmt.Printf("DEBUG: Will update gender_preference to: %s (was: %s)\n", user.GenderPreference, currentUser.GenderPreference)
	}

	if len(updates) > 0 {
		updates = append(updates, "updated_at = NOW()")
		query := fmt.Sprintf("UPDATE users SET %s WHERE id = $1", strings.Join(updates, ", "))
		_, err := r.db.Exec(ctx, query, args...)

		if err != nil {
			return fmt.Errorf("update failed: %w", err)
		}

		fmt.Printf("DEBUG: Update executed successfully\n")

		// Update cache with fresh data
		r.mu.Lock()
		r.cache[user.ID] = user
		r.mu.Unlock()
	}

	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id)

	if err != nil {
		return err
	}

	// Invalidate cache
	r.mu.Lock()
	delete(r.cache, id)
	r.mu.Unlock()

	return nil
}

func (r *UserRepository) List(ctx context.Context, limit, offset int) ([]*entities.User, error) {
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, gender, gender_preference, created_at, updated_at
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
			&user.Year, &user.Major, &user.Gender, &user.GenderPreference, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (r *UserRepository) ListAll(ctx context.Context) ([]*entities.User, error) {
	query := `
		SELECT id, email, first_name, last_name, avatar_url, bio, instagram, phone,
		       contact_preference, visibility, year, major, gender, gender_preference, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
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
			&user.Year, &user.Major, &user.Gender, &user.GenderPreference, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}
