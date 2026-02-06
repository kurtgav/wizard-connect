package entities

import "time"

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	FirstName    string    `json:"first_name" db:"first_name"`
	LastName     string    `json:"last_name" db:"last_name"`
	AvatarURL    string    `json:"avatar_url" db:"avatar_url"`
	Bio          string    `json:"bio" db:"bio"`
	Instagram    string    `json:"instagram" db:"instagram"`
	Phone        string    `json:"phone" db:"phone"`
	ContactPref  string    `json:"contact_preference" db:"contact_preference"` // email, phone, instagram
	Visibility   string    `json:"visibility" db:"visibility"`                  // public, matches_only, private
	Year         string    `json:"year" db:"year"`                              // 1st Year, 2nd Year, etc.
	Major        string    `json:"major" db:"major"`                            // CS, IT, etc.
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type Crush struct {
	ID         string    `json:"id" db:"id"`
	UserID     string    `json:"user_id" db:"user_id"`
	CrushEmail string    `json:"crush_email" db:"crush_email"`
	Rank       int       `json:"rank" db:"rank"` // 1-5, priority ranking
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type SurveyResponse struct {
	ID                string                 `json:"id" db:"id"`
	UserID            string                 `json:"user_id" db:"user_id"`
	Responses         map[string]interface{} `json:"responses" db:"responses"` // JSONB
	PersonalityType   string                 `json:"personality_type" db:"personality_type"`
	Interests         []string               `json:"interests" db:"interests"`
	Values            []string               `json:"values" db:"values"`
	Lifestyle         string                 `json:"lifestyle" db:"lifestyle"`
	CompletedAt       time.Time              `json:"completed_at" db:"completed_at"`
	IsComplete        bool                   `json:"is_complete" db:"is_complete"`
	CreatedAt         time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at" db:"updated_at"`
}

type Match struct {
	ID                   string    `json:"id" db:"id"`
	UserID               string    `json:"user_id" db:"user_id"`
	MatchedUserID        string    `json:"matched_user_id" db:"matched_user_id"`
	CompatibilityScore   float64   `json:"compatibility_score" db:"compatibility_score"`
	Rank                 int       `json:"rank" db:"rank"`
	IsMutualCrush        bool      `json:"is_mutual_crush" db:"is_mutual_crush"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
}

type Message struct {
	ID             string    `json:"id" db:"id"`
	ConversationID string    `json:"conversation_id" db:"conversation_id"`
	SenderID       string    `json:"sender_id" db:"sender_id"`
	Content        string    `json:"content" db:"content"`
	IsRead         bool      `json:"is_read" db:"is_read"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type Conversation struct {
	ID           string    `json:"id" db:"id"`
	Participant1 string    `json:"participant1" db:"participant1"`
	Participant2 string    `json:"participant2" db:"participant2"`
	LastMessage  string    `json:"last_message" db:"last_message"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}
