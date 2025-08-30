# Architecture Design & Implementation Guide

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend Application                      │
├──────────────────────────────────────────────────────────────┤
│                    Feature Modules Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Users    │  │    Tasks    │  │   Reports   │   ...   │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├──────────────────────────────────────────────────────────────┤
│                 Shared Components Layer                        │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ AsyncDataWrapper │  │   DataTable    │  │ UI Components│ │
│  └──────────────────┘  └───────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                   State Management Layer                       │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │  TanStack Query  │  │    Zustand     │  │   Context    │ │
│  └──────────────────┘  └───────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                    Data Access Layer                          │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │   Repositories   │  │  API Clients   │  │    Types     │ │
│  └──────────────────┘  └───────────────┘  └──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                     External Services                         │
│  ┌──────────────────┐  ┌───────────────┐                   │
│  │    Supabase      │  │  Third Party   │                   │
│  └──────────────────┘  └───────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── api/                              # Data Access Layer
│   ├── client/
│   │   └── supabase.client.ts       # Supabase client config
│   ├── repositories/
│   │   ├── base.repository.ts       # Abstract repository
│   │   ├── users.repository.ts      # User data operations
│   │   └── index.ts                 # Export all repositories
│   ├── hooks/                        # TanStack Query hooks
│   │   ├── users/
│   │   │   ├── useUsers.ts          # List users
│   │   │   ├── useUser.ts           # Single user
│   │   │   ├── useCreateUser.ts     # Create mutation
│   │   │   ├── useUpdateUser.ts     # Update mutation
│   │   │   └── useDeleteUser.ts     # Delete mutation
│   │   └── index.ts
│   └── types/
│       ├── api.types.ts             # API response types
│       ├── database.types.ts        # Supabase generated types
│       └── index.ts
│
├── components/                       # Shared Components Layer
│   ├── ui/                          # Base UI components
│   │   └── data-table/
│   │       ├── AsyncDataWrapper.tsx # Loading/Error/Empty handler
│   │       ├── DataTable.tsx        # Core table component
│   │       ├── DataTableToolbar.tsx # Search/Filter/Actions
│   │       ├── DataTablePagination.tsx
│   │       ├── DataTableSkeleton.tsx
│   │       ├── DataTableError.tsx
│   │       ├── DataTableEmpty.tsx
│   │       ├── hooks/
│   │       │   ├── useDataTable.ts  # Table state management
│   │       │   └── useTableFeatures.ts
│   │       ├── types.ts             # Table types
│   │       └── index.ts
│   └── shared/                      # Other shared components
│
├── features/                        # Feature Modules
│   └── users/
│       ├── components/
│       │   ├── UsersTableColumns.tsx # Column definitions
│       │   ├── UsersTableFilters.tsx # Filter components
│       │   ├── UsersTableActions.tsx # Bulk/row actions
│       │   ├── UserCreateDialog.tsx
│       │   ├── UserEditDialog.tsx
│       │   └── UserDeleteDialog.tsx
│       ├── hooks/
│       │   └── useUsersTable.ts     # Feature-specific logic
│       ├── types/
│       │   └── index.ts             # User types
│       └── index.tsx                # Main users page
│
└── lib/                             # Utilities
    ├── utils.ts
    └── validators.ts
```

## Implementation Phases

### Phase 1: Database Schema Update

```sql
-- Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  username TEXT UNIQUE,
  phone_number TEXT,
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'invited', 'suspended'));

-- Update role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'superadmin', 'manager', 'cashier'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
```

### Phase 2: Repository Layer

```typescript
// api/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected tableName: string) {}
  
  protected handleError(error: unknown): never {
    console.error(`Repository error in ${this.tableName}:`, error)
    throw error
  }
}

// api/repositories/users.repository.ts
import { supabase } from '@/api/client/supabase.client'
import { BaseRepository } from './base.repository'
import type { User, UserFilters, CreateUserDto, UpdateUserDto } from '@/api/types'

export class UsersRepository extends BaseRepository<User> {
  constructor() {
    super('profiles')
  }

  async findAll(filters?: UserFilters) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    
    if (filters?.search) {
      query = query.or(`email.ilike.%${filters.search}%,username.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    
    if (error) this.handleError(error)
    return data as User[]
  }

  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) this.handleError(error)
    return data as User
  }

  async create(dto: CreateUserDto) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      user_metadata: {
        given_name: dto.firstName,
        family_name: dto.lastName,
      }
    })
    
    if (error) this.handleError(error)
    return data.user
  }

  async update(id: string, dto: UpdateUserDto) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(dto)
      .eq('id', id)
      .select()
      .single()
    
    if (error) this.handleError(error)
    return data as User
  }

  async delete(id: string) {
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) this.handleError(error)
  }
}

export const usersRepository = new UsersRepository()
```

### Phase 3: TanStack Query Hooks

```typescript
// api/hooks/users/useUsers.ts
import { useQuery } from '@tanstack/react-query'
import { usersRepository } from '@/api/repositories'
import type { UserFilters } from '@/api/types'

export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersRepository.findAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// api/hooks/users/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersRepository } from '@/api/repositories'
import { toast } from 'sonner'

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersRepository.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create user')
    }
  })
}
```

### Phase 4: Composable Table Components

```typescript
// components/ui/data-table/AsyncDataWrapper.tsx
interface AsyncDataWrapperProps<T> {
  data?: T[]
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
  renderSkeleton: React.ReactNode
  renderError?: (error: Error, retry?: () => void) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  children: (data: T[]) => React.ReactNode
}

export function AsyncDataWrapper<T>({
  data,
  isLoading,
  error,
  onRetry,
  renderSkeleton,
  renderError,
  renderEmpty,
  children,
}: AsyncDataWrapperProps<T>) {
  if (isLoading) return <>{renderSkeleton}</>
  
  if (error) {
    return renderError ? (
      <>{renderError(error, onRetry)}</>
    ) : (
      <DataTableError error={error} onRetry={onRetry} />
    )
  }
  
  if (!data || data.length === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : <DataTableEmpty />
  }
  
  return <>{children(data)}</>
}

// components/ui/data-table/DataTable.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  toolbar?: React.ReactNode
  pagination?: React.ReactNode
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  toolbar,
  pagination,
  onRowClick,
  rowActions,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    // ... table config
  })
  
  return (
    <div className="space-y-4">
      {toolbar}
      <div className="rounded-md border">
        <Table>
          {/* Table implementation */}
        </Table>
      </div>
      {pagination}
    </div>
  )
}
```

### Phase 5: Feature Implementation

```typescript
// features/users/index.tsx
export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({})
  const { data, isLoading, error, refetch } = useUsers(filters)
  
  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage your users and their roles"
        actions={<UserCreateButton />}
      />
      
      <AsyncDataWrapper
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        renderSkeleton={<DataTableSkeleton columns={6} rows={10} />}
        renderEmpty={() => <UsersEmptyState />}
      >
        {(users) => (
          <DataTable
            data={users}
            columns={usersColumns}
            toolbar={
              <DataTableToolbar
                searchPlaceholder="Search users..."
                onSearchChange={(search) => setFilters({ ...filters, search })}
                filters={
                  <UsersTableFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                }
              />
            }
            pagination={
              <DataTablePagination
                pageSize={20}
                pageSizes={[10, 20, 50, 100]}
              />
            }
            rowActions={(user) => (
              <UserRowActions user={user} />
            )}
          />
        )}
      </AsyncDataWrapper>
    </div>
  )
}
```

## Testing Strategy

```typescript
// Repository tests
describe('UsersRepository', () => {
  it('should fetch users with filters', async () => {
    const users = await usersRepository.findAll({ status: 'active' })
    expect(users).toBeDefined()
    expect(users.every(u => u.status === 'active')).toBe(true)
  })
})

// Hook tests
describe('useUsers', () => {
  it('should return users data', async () => {
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

// Component tests
describe('DataTable', () => {
  it('should render data rows', () => {
    render(
      <DataTable
        data={mockUsers}
        columns={columns}
      />
    )
    expect(screen.getAllByRole('row')).toHaveLength(mockUsers.length + 1)
  })
})
```

## Performance Optimizations

### 1. Query Optimization
- Use select() to fetch only needed fields
- Implement pagination at database level
- Add database indexes

### 2. Frontend Optimization
- Virtual scrolling for large datasets
- Memoize expensive computations
- Lazy load dialogs and modals

### 3. Caching Strategy
- 30s stale time for list queries
- Optimistic updates for mutations
- Background refetch on window focus

## Migration Strategy

### From Current Code to New Architecture

1. **Phase 1**: Build repository layer
   - Create base repository class
   - Implement users repository
   - Test with Supabase client

2. **Phase 2**: Extract common table components
   - Move pagination, toolbar, filters to shared
   - Create AsyncDataWrapper
   - Build reusable DataTable

3. **Phase 3**: Connect via TanStack Query hooks
   - Create query hooks for users
   - Add mutation hooks
   - Set up optimistic updates

4. **Phase 4**: Refactor features to use both
   - Update users feature
   - Apply pattern to other features
   - Remove old fake data

This architecture provides a scalable, maintainable foundation for your data-driven tables while maintaining flexibility for future requirements.