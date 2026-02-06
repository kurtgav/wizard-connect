import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { URL } from 'url'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // For OAuth callbacks, the code handling is done by Supabase
    // We just need to redirect to the app
    // The session will be automatically handled by Supabase client
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/survey', requestUrl.origin))
}
