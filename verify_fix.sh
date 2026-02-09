#!/bin/bash

# Configuration
API_URL="https://wizardconnect-backend.onrender.com"
SUPABASE_URL="https://dqmmepouerbfkcwbayjj.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbW1lcG91ZXJiZmtjd2JheWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTcyMjYsImV4cCI6MjA4NTkzMzIyNn0.1-q8B84afiCHdHoWZ9sjhyvylSivl2CjA2oBY3DezBY"

echo "----------------------------------------"
echo "1. Testing Supabase Connection (Campaigns)"
# This mimics the frontend fetch for campaigns
curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" "$SUPABASE_URL/rest/v1/campaigns?select=*" | head -n 5
echo ""

echo "----------------------------------------"
echo "2. Testing Supabase Connection (Stories)"
# This mimics the frontend fetch for stories
curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" "$SUPABASE_URL/rest/v1/stories?select=*" | head -n 5
echo ""

echo "----------------------------------------"
echo "3. Testing Backend Health"
curl -s -v "$API_URL/health"
echo ""
