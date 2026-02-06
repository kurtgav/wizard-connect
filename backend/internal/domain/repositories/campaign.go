package repositories

import (
	"context"

	"wizard-connect/internal/domain/entities"
)

type CampaignRepository interface {
	Create(ctx context.Context, campaign *entities.Campaign) error
	GetByID(ctx context.Context, id string) (*entities.Campaign, error)
	GetAll(ctx context.Context) ([]*entities.Campaign, error)
	Update(ctx context.Context, campaign *entities.Campaign) error
	Delete(ctx context.Context, id string) error
}
