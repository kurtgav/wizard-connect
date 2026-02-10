package controllers

import (
	"context"
	"fmt"
	"net/http"

	"wizard-connect/internal/domain/entities"
	"wizard-connect/internal/infrastructure/database"
	"wizard-connect/internal/interface/http/middleware"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
)

type MessageController struct {
	conversationRepo *database.ConversationRepository
	messageRepo      *database.MessageRepository
	userRepo         *database.UserRepository
	socketServer     *socketio.Server
}

func NewMessageController(
	conversationRepo *database.ConversationRepository,
	messageRepo *database.MessageRepository,
	userRepo *database.UserRepository,
	socketServer *socketio.Server,
) *MessageController {
	return &MessageController{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		userRepo:         userRepo,
		socketServer:     socketServer,
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

	type OtherParticipant struct {
		ID        string `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		AvatarURL string `json:"avatar_url"`
		Online    bool   `json:"online"`
	}

	type ConversationWithDetails struct {
		ID               string           `json:"id"`
		OtherParticipant OtherParticipant `json:"other_participant"`
		LastMessage      string           `json:"last_message"`
		UpdatedAt        string           `json:"updated_at"`
		UnreadCount      int              `json:"unread_count"`
	}

	result := make([]ConversationWithDetails, 0, len(conversations))
	for _, conv := range conversations {
		otherUserID := conv.Participant1
		if otherUserID == userID {
			otherUserID = conv.Participant2
		}

		fmt.Printf("DEBUG: Fetching profile for other participant %s in conversation %s\n", otherUserID, conv.ID)
		otherUser, err := ctrl.userRepo.GetByID(c.Request.Context(), otherUserID)
		if err != nil {
			fmt.Printf("ERROR: Failed to fetch user %s: %v\n", otherUserID, err)
			continue
		}
		fmt.Printf("DEBUG: Fetched user %s: %+v\n", otherUserID, otherUser)

		// Get unread count
		unreadCount, _ := ctrl.messageRepo.GetUnreadCount(c.Request.Context(), userID)

		result = append(result, ConversationWithDetails{
			ID: conv.ID,
			OtherParticipant: OtherParticipant{
				ID:        otherUser.ID,
				FirstName: otherUser.FirstName,
				LastName:  otherUser.LastName,
				AvatarURL: otherUser.AvatarURL,
				Online:    false, // TODO: Implement online status
			},
			LastMessage: conv.LastMessage,
			UpdatedAt:   conv.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			UnreadCount: unreadCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

// GetMessages retrieves messages for a specific conversation
func (ctrl *MessageController) GetMessages(c *gin.Context) {
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

	// Get messages with pagination
	limit := 50
	offset := 0

	messages, err := ctrl.messageRepo.GetByConversationID(c.Request.Context(), conversationID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve messages"})
		return
	}

	// Mark messages as read
	go func() {
		ctx := context.Background()
		for _, msg := range messages {
			if !msg.IsRead && msg.SenderID != userID {
				_ = ctrl.messageRepo.MarkAsRead(ctx, msg.ID)
			}
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"data":            messages,
		"current_user_id": userID,
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

	// Update conversation last message
	_ = ctrl.conversationRepo.UpdateLastMessage(c.Request.Context(), conversationID, req.Content)

	// Broadcast via WebSocket for real-time update
	if ctrl.socketServer != nil {
		payload := gin.H{
			"id":        message.ID,
			"roomId":    conversationID,
			"userId":    userID,
			"message":   req.Content,
			"timestamp": message.CreatedAt.UnixMilli(),
		}
		ctrl.socketServer.BroadcastToRoom("/", conversationID, "receive-message", payload)
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    message,
		"message": "Message sent successfully",
	})
}

// CreateConversation creates a new conversation with another user
func (ctrl *MessageController) CreateConversation(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		OtherUserID string `json:"other_user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if conversation already exists
	conv, err := ctrl.conversationRepo.GetByParticipants(c.Request.Context(), userID, req.OtherUserID)
	if err == nil && conv != nil {
		c.JSON(http.StatusOK, gin.H{
			"data":    conv,
			"message": "Conversation already exists",
		})
		return
	}

	// Create new conversation
	newConv := &entities.Conversation{
		Participant1: userID,
		Participant2: req.OtherUserID,
	}

	if err := ctrl.conversationRepo.Create(c.Request.Context(), newConv); err != nil {
		fmt.Printf("ERROR: Failed to create conversation: userID=%s, otherUserID=%s, error=%v\n", userID, req.OtherUserID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    newConv,
		"message": "Conversation created successfully",
	})
}
