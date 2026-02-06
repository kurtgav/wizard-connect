package database

import (
	"context"
	"wizard-connect/internal/domain/entities"
)

type MessageRepository struct {
	db *Database
}

func NewMessageRepository(db *Database) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, message *entities.Message) error {
	query := `
		INSERT INTO messages (conversation_id, sender_id, content, is_read)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(ctx, query,
		message.ConversationID, message.SenderID, message.Content, message.IsRead,
	).Scan(&message.ID, &message.CreatedAt)

	return err
}

func (r *MessageRepository) GetByConversationID(ctx context.Context, conversationID string, limit, offset int) ([]*entities.Message, error) {
	query := `
		SELECT id, conversation_id, sender_id, content, is_read, created_at
		FROM messages
		WHERE conversation_id = $1
		ORDER BY created_at ASC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, conversationID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*entities.Message
	for rows.Next() {
		message := &entities.Message{}
		err := rows.Scan(
			&message.ID, &message.ConversationID, &message.SenderID,
			&message.Content, &message.IsRead, &message.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	return messages, nil
}

func (r *MessageRepository) MarkAsRead(ctx context.Context, messageID string) error {
	query := `UPDATE messages SET is_read = true WHERE id = $1`
	_, err := r.db.Exec(ctx, query, messageID)
	return err
}

func (r *MessageRepository) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM messages m
		JOIN conversations c ON m.conversation_id = c.id
		WHERE (c.participant1 = $1 OR c.participant2 = $1)
		AND m.sender_id != $1
		AND m.is_read = false
	`

	var count int
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}
