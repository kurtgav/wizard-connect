package websocket

import (
	"fmt"
	"log"
	"net/http"

	"wizard-connect/internal/infrastructure/database"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
)

type SocketHandler struct {
	Server           *socketio.Server
	conversationRepo *database.ConversationRepository
	messageRepo      *database.MessageRepository
	userRepo         *database.UserRepository
}

type MessagePayload struct {
	ID        string `json:"id"`
	RoomID    string `json:"roomId"`
	UserID    string `json:"userId"`
	Message   string `json:"message"`
	Timestamp int64  `json:"timestamp"`
}

func NewSocketHandler(
	conversationRepo *database.ConversationRepository,
	messageRepo *database.MessageRepository,
	userRepo *database.UserRepository,
) (*SocketHandler, error) {
	// Configure engine.io options
	opts := &engineio.Options{
		Transports: []transport.Transport{
			&polling.Transport{
				CheckOrigin: func(r *http.Request) bool { return true },
			},
			&websocket.Transport{
				CheckOrigin: func(r *http.Request) bool { return true },
			},
		},
	}

	server := socketio.NewServer(opts)

	handler := &SocketHandler{
		Server:           server,
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		userRepo:         userRepo,
	}

	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		fmt.Println("WS Connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "join-room", func(s socketio.Conn, roomID string) {
		s.Join(roomID)
		fmt.Printf("WS User %s joined room %s\n", s.ID(), roomID)
	})

	server.OnEvent("/", "identify", func(s socketio.Conn, userID string) {
		s.Join("user_" + userID)
		fmt.Printf("WS User %s identified as %s and joined their private room\n", s.ID(), userID)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("WS Disconnected:", s.ID(), reason)
	})

	go func() {
		if err := server.Serve(); err != nil {
			log.Fatalf("socketio listen error: %s\n", err)
		}
	}()

	return handler, nil
}

func (h *SocketHandler) Handler() gin.HandlerFunc {
	return func(c *gin.Context) {
		h.Server.ServeHTTP(c.Writer, c.Request)
	}
}
