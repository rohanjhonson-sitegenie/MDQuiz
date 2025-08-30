export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryOptions {
  page?: number
  pageSize?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}
