import { z } from 'zod'

const profileRoleSchema = z.union([z.literal('user'), z.literal('admin')])
export type ProfileRole = z.infer<typeof profileRoleSchema>

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
})
export type Profile = z.infer<typeof profileSchema>

export const profileListSchema = z.array(profileSchema)
