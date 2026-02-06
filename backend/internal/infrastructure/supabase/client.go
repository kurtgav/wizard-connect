package supabase

import (
	"context"
	"fmt"

	"github.com/supabase-community/supabase-go"
)

type Client struct {
	client *supabase.Client
	url    string
	key    string
}

func NewClient(url, key string) (*Client, error) {
	if url == "" || key == "" {
		return nil, fmt.Errorf("supabase URL and key are required")
	}

	client, err := supabase.NewClient(url, key, &supabase.ClientOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to create supabase client: %w", err)
	}

	return &Client{
		client: client,
		url:    url,
		key:    key,
	}, nil
}

// From extracts the supabase client from context
func From(ctx context.Context) *supabase.Client {
	if client, ok := ctx.Value("supabase").(*supabase.Client); ok {
		return client
	}
	return nil
}

// To adds the supabase client to context
func To(ctx context.Context, client *supabase.Client) context.Context {
	return context.WithValue(ctx, "supabase", client)
}

// GetClient returns the underlying supabase client
func (c *Client) GetClient() *supabase.Client {
	return c.client
}
