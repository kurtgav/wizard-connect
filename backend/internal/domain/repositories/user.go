package repositories

import (
	"context"

	"wizard-connect/internal/domain/entities"
)

type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id string) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]*entities.User, error)
}

type SurveyRepository interface {
	CreateOrUpdate(ctx context.Context, survey *entities.SurveyResponse) error
	GetByUserID(ctx context.Context, userID string) (*entities.SurveyResponse, error)
	GetCompletedSurveys(ctx context.Context) ([]*entities.SurveyResponse, error)
}

type CrushRepository interface {
	Create(ctx context.Context, crush *entities.Crush) error
	GetByUserID(ctx context.Context, userID string) ([]*entities.Crush, error)
	Delete(ctx context.Context, id string) error
}

type MatchRepository interface {
	Create(ctx context.Context, match *entities.Match) error
	GetByUserID(ctx context.Context, userID string) ([]*entities.Match, error)
	GetMatch(ctx context.Context, userID, matchedUserID string) (*entities.Match, error)
	DeleteByUserID(ctx context.Context, userID string) error
}

type MessageRepository interface {
	Create(ctx context.Context, message *entities.Message) error
	GetByConversationID(ctx context.Context, conversationID string, limit, offset int) ([]*entities.Message, error)
	MarkAsRead(ctx context.Context, messageID string) error
	GetUnreadCount(ctx context.Context, userID string) (int, error)
}

type ConversationRepository interface {
	Create(ctx context.Context, conv *entities.Conversation) error
	GetByParticipants(ctx context.Context, participant1, participant2 string) (*entities.Conversation, error)
	GetByUserID(ctx context.Context, userID string) ([]*entities.Conversation, error)
	UpdateLastMessage(ctx context.Context, conversationID, lastMessage string) error
}
