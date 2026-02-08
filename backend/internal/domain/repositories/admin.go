package repositories

import "context"

type AdminRepository interface {
	IsAdmin(ctx context.Context, userID string) (bool, error)
	AddAdmin(ctx context.Context, email string) error
	RemoveAdmin(ctx context.Context, email string) error
	ListAdmins(ctx context.Context) ([]string, error)
}
