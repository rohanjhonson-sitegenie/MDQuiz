export interface Profile {
  id: string
  email: string
  display_name: string
  given_name: string | null
  family_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface ProfileFilters {
  role?: 'user' | 'admin'
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateProfileDto {
  display_name?: string
  given_name?: string
  family_name?: string
  avatar_url?: string
  role?: 'user' | 'admin'
}

export interface InviteUserDto {
  email: string
  role?: 'user' | 'admin'
}
