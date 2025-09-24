/**
 * Satellite Database Client Helper
 * Simple utility for exchanging CTID tokens for satellite database access
 */

interface TokenExchangeResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Exchange CTID JWT token for satellite database token
 * Following OAuth 2.0 RFC 8693 Token Exchange specification
 */
export async function exchangeTokenForSatellite(
  ctidToken: string,
  _satelliteProjectRef: string
): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL environment variable is not set')
  }
  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY environment variable is not set')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/token-exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      subject_token: ctidToken,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`
    )
  }

  const data: TokenExchangeResponse = await response.json()
  return data.access_token
}