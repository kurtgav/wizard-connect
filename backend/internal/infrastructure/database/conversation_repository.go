package database

import (
	"context"
	"wizard-connect/internal/domain/entities"
)

type ConversationRepository struct {
	db *Database
}

func NewConversationRepository(db *Database) *ConversationRepository {
	return &ConversationRepository{db: db}
}

func (r *ConversationRepository) Create(ctx context.Context, conv *entities.Conversation) error {
	// Ensure consistent ordering (participant1 < participant2) to satisfy CHECK constraint
	if conv.Participant1 > conv.Participant2 {
		conv.Participant1, conv.Participant2 = conv.Participant2, conv.Participant1
	}

	query := `
		INSERT INTO conversations (participant1, participant2)
		VALUES ($1, $2)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(ctx, query,
		conv.Participant1, conv.Participant2,
	).Scan(&conv.ID, &conv.CreatedAt)

	return err
}

func (r *ConversationRepository) GetByParticipants(ctx context.Context, participant1, participant2 string) (*entities.Conversation, error) {
	// Ensure consistent ordering (participant1 < participant2)
	p1, p2 := participant1, participant2
	if p1 > p2 {
		p1, p2 = p2, p1
	}

	query := `
		SELECT id, participant1, participant2, COALESCE(last_message, '') as last_message, updated_at, created_at
		FROM conversations
		WHERE participant1 = $1 AND participant2 = $2
	`

	conv := &entities.Conversation{}
	err := r.db.QueryRow(ctx, query, p1, p2).Scan(
		&conv.ID, &conv.Participant1, &conv.Participant2,
		&conv.LastMessage, &conv.UpdatedAt, &conv.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return conv, nil
}

func (r *ConversationRepository) GetByUserID(ctx context.Context, userID string) ([]*entities.Conversation, error) {
	query := `
		SELECT id, participant1, participant2, COALESCE(last_message, '') as last_message, updated_at, created_at
		FROM conversations
		WHERE participant1 = $1 OR participant2 = $1
		ORDER BY updated_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conversations []*entities.Conversation
	for rows.Next() {
		conv := &entities.Conversation{}
		err := rows.Scan(
			&conv.ID, &conv.Participant1, &conv.Participant2,
			&conv.LastMessage, &conv.UpdatedAt, &conv.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		conversations = append(conversations, conv)
	}

	return conversations, nil
}

func (r *ConversationRepository) UpdateLastMessage(ctx context.Context, conversationID, lastMessage string) error {
	query := `
		UPDATE conversations
		SET last_message = $2, updated_at = NOW()
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, conversationID, lastMessage)
	return err
}

func (r *ConversationRepository) GetByID(ctx context.Context, id string) (*entities.Conversation, error) {
	query := `
		SELECT id, participant1, participant2, COALESCE(last_message, '') as last_message, updated_at, created_at
		FROM conversations
		WHERE id = $1
	`

	conv := &entities.Conversation{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&conv.ID, &conv.Participant1, &conv.Participant2,
		&conv.LastMessage, &conv.UpdatedAt, &conv.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return conv, nil
}
