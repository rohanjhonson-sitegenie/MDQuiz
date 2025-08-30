import { StatusBadge, Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active' as const,
    priority: 'high',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'inactive' as const,
    priority: 'low',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    status: 'suspended' as const,
    priority: 'critical',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'User',
    status: 'invited' as const,
    priority: 'medium',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Developer',
    status: 'pending' as const,
    priority: 'high',
  },
]

const priorityConfig = {
  critical: { variant: 'error' as const, label: 'Critical' },
  high: { variant: 'warning' as const, label: 'High' },
  medium: { variant: 'informative' as const, label: 'Medium' },
  low: { variant: 'neutral' as const, label: 'Low' },
}

const roleConfig = {
  Admin: { variant: 'brand' as const },
  Manager: { variant: 'secondary' as const },
  Developer: { variant: 'informative' as const },
  User: { variant: 'neutral' as const },
}

export function BadgesInTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges in Tables</CardTitle>
        <CardDescription>
          Example of how badges integrate with data tables for status and
          categorization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className='font-medium'>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      roleConfig[user.role as keyof typeof roleConfig].variant
                    }
                    size='sm'
                    emphasis='light'
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} size='sm' />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      priorityConfig[
                        user.priority as keyof typeof priorityConfig
                      ].variant
                    }
                    size='sm'
                  >
                    {
                      priorityConfig[
                        user.priority as keyof typeof priorityConfig
                      ].label
                    }
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
