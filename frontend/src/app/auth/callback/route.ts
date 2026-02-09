import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Create a Supabase client with cookie store
  const cookieStore = await cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string): any => {
            const cookie = cookieStore.get(key)
            return cookie?.value
          },
          setItem: (key: string, value: string) => {
            cookieStore.set({ name: key, value, ...getCookieOptions() })
          },
          removeItem: (key: string) => {
            cookieStore.delete({ name: key, ...getCookieOptions() })
          },
        },
      },
    }
  )

  let redirectUrl = '/survey'

  if (code) {
    // Exchange code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Session established successfully
      // Check if there's a stored redirect URL from login page
      // Note: We can't access sessionStorage in server component,
      // so we redirect to a client-side callback page that handles this

      // Set a cookie to indicate successful auth
      cookieStore.set({
        name: 'auth_callback_success',
        value: 'true',
        ...getCookieOptions(),
      })

      // Redirect to interactive callback page instead of auto-redirect
      // This requires user interaction to prevent Chrome state deletion
      redirectUrl = '/auth/callback/confirm'
    }
  }

  // Return HTML with redirect
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
        <script>window.location.href = '${redirectUrl}';</script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f0f0f0;
            color: #333;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #1e3a8a;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 1rem;
            cursor: pointer;
            border: none;
            font-size: 16px;
            font-weight: 500;
          }
          .btn:hover {
            background: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Authentication Successful!</h2>
          <p>Redirecting to Wizard Connect...</p>
          <a href="${redirectUrl}" class="btn">Continue to App</a>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}

function getCookieOptions() {
  return {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  }
}
