// Development-only auth bypass
// This file allows you to access admin routes without CTID authentication
// REMOVE THIS FILE BEFORE PRODUCTION DEPLOYMENT

export const requireRole =
  (allowedRoles: string[]) =>
  async ({ location }: { location: { href: string } }) => {
    // In development, always return a mock admin user
    if (import.meta.env.DEV) {
      console.warn('🚧 DEV MODE: Auth bypass active - user granted admin access')
      return {
        user: {
          id: 'dev-admin',
          email: 'dev-admin@localhost',
          userRole: 'admin',
          name: 'Development Admin'
        },
        userProfile: 'admin',
        decodedToken: {
          user_role: 'admin',
          email: 'dev-admin@localhost',
          name: 'Development Admin'
        }
      }
    }

    // In production, this file should not exist
    throw new Error('Development auth bypass should not be used in production')
  }