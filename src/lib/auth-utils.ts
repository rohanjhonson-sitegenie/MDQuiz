/**
 * Central ID authentication utilities
 * Handles logout and redirect operations for CautionTape ID Service
 */

/**
 * Get the Central ID Service URL from environment variables
 */
export function getCentralIdServiceUrl(): string {
  return import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
}

/**
 * Logout with Central ID Service
 * Redirects to central logout endpoint to clear global session
 */
export function logoutWithCentralId(returnTo?: string): void {
  const idServiceUrl = getCentralIdServiceUrl()
  const defaultReturnTo = `${location.origin}/`
  const logoutReturnTo = returnTo || defaultReturnTo

  const logoutUrl = `${idServiceUrl}/logout?return_to=${encodeURIComponent(logoutReturnTo)}`

  // Perform full page redirect to central ID service logout
  location.assign(logoutUrl)
}
