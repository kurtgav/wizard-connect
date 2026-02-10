package websocket

import (
	"fmt"
	"log"
	"net/http"

	"strings"
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
		// Set CORS headers for Socket.IO
		origin := c.Request.Header.Get("Origin")
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, Content-Length, X-CSRF-Token, Token, session, Origin, Host, Connection, Accept-Encoding, Accept-Language, X-Requested-With")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		// Strip the /api/v1 prefix so the server sees /socket.io/...
		c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, "/api/v1")

		h.Server.ServeHTTP(c.Writer, c.Request)
	}
}
