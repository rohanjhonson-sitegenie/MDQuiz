# Architecture Linting & Validation

This project enforces architectural boundaries using a hybrid approach with ESLint and dependency-cruiser.

## Quick Start

```bash
# Run all architecture checks
npm run arch:validate

# Check dependencies only
npm run arch:check

# Generate dependency graph
npm run arch:graph
```

## Architecture Rules

### Feature Boundaries

Features are located in `src/features/` and follow this structure:
- `api/` - External API interfaces (can only import shared utilities)
- `components/` - UI components (can import api, hooks, shared)
- `hooks/` - Custom hooks (can import api, shared)
- `*` - Internal implementation (can import api, hooks, components, shared)

### Cross-Feature Communication

❌ **Forbidden**: Direct imports between feature internals
```typescript
// ❌ Bad - direct cross-feature import
import { UserCard } from '@/features/users/components/UserCard'
```

✅ **Allowed**: Communication through shared utilities or route navigation
```typescript
// ✅ Good - using shared component
import { Card } from '@/components/ui/card'

// ✅ Good - navigation to other features
navigate('/users')
```

## Tools

### ESLint Boundaries (Real-time)
- Provides immediate feedback in IDE
- Catches boundary violations during development
- Configured in `eslint.config.js`

### Dependency-Cruiser (CI/Build)
- Comprehensive architecture validation
- Generates visual dependency graphs
- Configured in `.dependency-cruiser.js`

## Violation Examples

### Cross-Feature Import
```typescript
// ❌ This will fail ESLint boundaries check
import { TaskItem } from '@/features/tasks/components/TaskItem'
```

**Fix**: Use shared components or navigation instead.

### API Layer Violation
```typescript
// ❌ This will fail dependency-cruiser
// File: src/features/users/api/users.ts
import { UserForm } from '../components/UserForm'
```

**Fix**: API layer should only import shared utilities.

## Visual Documentation

Generate architecture graphs:
```bash
npm run arch:graph
```

This creates `architecture-graph.html` showing:
- Feature dependencies
- Architectural layers
- Import relationships

## Integration with Development Workflow

Architecture checks are integrated into:
- Real-time ESLint feedback in IDE
- Build process validation
- CI/CD pipeline (when configured)

## Configuration Files

- `eslint.config.js` - ESLint boundaries rules
- `.dependency-cruiser.js` - Dependency-cruiser architecture rules
- `scripts/arch-check.js` - Combined validation helper

## Troubleshooting

### Common Issues

1. **Cross-feature imports**: Refactor to use shared components or navigation
2. **API boundary violations**: Move shared logic to `src/lib/` or feature api layer
3. **Missing boundaries**: Update element patterns in ESLint config

### Checking Specific Files

```bash
# Check specific directory
npx depcruise src/features/users --config .dependency-cruiser.js

# ESLint specific files
npx eslint src/features/users/components/
```