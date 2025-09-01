import type {
  Profile,
  ProfileFilters,
  UpdateProfileDto,
  InviteUserDto,
} from '@/types/app.types'
import { supabase } from '@/lib/supabase'
import { BaseRepository } from './base.repository'

export class ProfilesRepository extends BaseRepository {
  constructor() {
    super('profiles')
  }

  async findAll(
    filters?: ProfileFilters
  ): Promise<{ profiles: Profile[]; total: number }> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%`
      )
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      )
    }

    const { data, error, count } = await query

    if (error) this.handleError(error)
    return { profiles: data as Profile[], total: count || 0 }
  }

  async findById(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) this.handleError(error)
    return data as Profile
  }

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(dto)
      .eq('id', id)
      .select()
      .single()

    if (error) this.handleError(error)
    return data as Profile
  }

  async inviteUser(dto: InviteUserDto): Promise<{ user: unknown }> {
    // Note: This requires service role key or proper admin setup
    // For now, we'll use the auth API with the current user's session
    const { data, error } = await supabase.auth.signInWithOtp({
      email: dto.email,
      options: {
        data: {
          role: dto.role || 'user',
        },
      },
    })

    if (error) this.handleError(error)
    return { user: data }
  }
}

export const profilesRepository = new ProfilesRepository()
