#!/bin/bash

# Configuration
API_URL="https://wizardconnect-backend.onrender.com"
# Use the anon key from the env file we saw
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbW1lcG91ZXJiZmtjd2JheWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTcyMjYsImV4cCI6MjA4NTkzMzIyNn0.1-q8B84afiCHdHoWZ9sjhyvylSivl2CjA2oBY3DezBY"

echo "Testing API Connectivity to: $API_URL"

# 1. Health Check
echo "----------------------------------------"
echo "1. Checking Health Endpoint..."
curl -s -v "$API_URL/health"
echo ""

# 2. Check Campaigns (Public endpoint or via Supabase)
# If the Go backend exposes a direct endpoint, use it.
# Otherwise, check via Supabase direct REST if we suspect Go is down.
# Let's try hitting a known endpoint.
echo "----------------------------------------"
echo "2. Checking Campaigns Endpoint..."
curl -s -H "Authorization: Bearer $ANON_KEY" "$API_URL/api/v1/campaigns"
echo ""

# 3. Check Supabase Direct (to rule out Database being down)
SUPABASE_URL="https://dqmmepouerbfkcwbayjj.supabase.co"
echo "----------------------------------------"
echo "3. Checking Supabase Direct (Campaigns)..."
curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" "$SUPABASE_URL/rest/v1/campaigns?select=*"
echo ""
