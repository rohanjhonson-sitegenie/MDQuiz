import { z } from 'zod'
import type { Profile } from '@/types/app.types'

// Re-export the Profile type for backwards compatibility
export type { Profile } from '@/types/app.types'

const profileRoleSchema = z.union([z.literal('user'), z.literal('admin')])
export type ProfileRole = z.infer<typeof profileRoleSchema>

// Use the generated Profile type for validation schema
const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string(),
  given_name: z.string().nullable(),
  family_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: profileRoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<Profile>

export const profileListSchema = z.array(profileSchema)
