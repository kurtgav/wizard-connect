package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"
)

type MessageController struct {
	conversationRepo *database.ConversationRepository
	messageRepo      *database.MessageRepository
	userRepo         *database.UserRepository
}

func NewMessageController(
	conversationRepo *database.ConversationRepository,
	messageRepo *database.MessageRepository,
	userRepo *database.UserRepository,
) *MessageController {
	return &MessageController{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		userRepo:         userRepo,
	}
}

// GetConversations retrieves all conversations for the current user
func (ctrl *MessageController) GetConversations(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	conversations, err := ctrl.conversationRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve conversations"})
		return
	}

	type ConversationWithDetails struct {
		ID              string `json:"id"`
		OtherUserID     string `json:"other_user_id"`
		OtherUserName   string `json:"other_user_name"`
		OtherUserAvatar string `json:"other_user_avatar"`
		LastMessage     string `json:"last_message"`
		UpdatedAt       string `json:"updated_at"`
		UnreadCount     int    `json:"unread_count"`
	}

	result := make([]ConversationWithDetails, 0, len(conversations))
	for _, conv := range conversations {
		otherUserID := conv.Participant1
		if otherUserID == userID {
			otherUserID = conv.Participant2
		}

		otherUser, err := ctrl.userRepo.GetByID(c.Request.Context(), otherUserID)
		if err != nil {
			continue
		}

		result = append(result, ConversationWithDetails{
			ID:              conv.ID,
			OtherUserID:     otherUser.ID,
			OtherUserName:   otherUser.FirstName + " " + otherUser.LastName,
			OtherUserAvatar: otherUser.AvatarURL,
			LastMessage:     conv.LastMessage,
			UpdatedAt:       conv.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			UnreadCount:     0, // TODO: Calculate from unread messages
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

// GetMessages retrieves messages for a specific conversation
func (ctrl *MessageController) GetMessages(c *gin.Context) {
	_, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	conversationID := c.Param("id")
	if conversationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Conversation ID is required"})
		return
	}

	// Get messages with pagination
	limit := 50
	offset := 0

	messages, err := ctrl.messageRepo.GetByConversationID(c.Request.Context(), conversationID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": messages,
	})
}

// SendMessage sends a new message
func (ctrl *MessageController) SendMessage(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	conversationID := c.Param("id")
	if conversationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Conversation ID is required"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message content cannot be empty"})
		return
	}

	message := &entities.Message{
		ConversationID: conversationID,
		SenderID:       userID,
		Content:        req.Content,
		IsRead:         false,
	}

	if err := ctrl.messageRepo.Create(c.Request.Context(), message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    message,
		"message": "Message sent successfully",
	})
}
