# ClassHub Design System Guide

## Overview

ClassHub's design system is a comprehensive, Dell Design System-inspired framework that ensures consistency, accessibility, and scalability across the entire application. This guide documents the core principles, components, and patterns used throughout the platform.

## Design Principles

### 1. **Semantic Design**
- Components use meaningful names that describe their purpose
- Color system based on intent (informative, success, warning, error, neutral, brand)
- Clear visual hierarchy through emphasis levels

### 2. **Accessibility First**
- WCAG compliant color contrasts
- Keyboard navigation support
- Screen reader friendly components
- Clear focus states

### 3. **Consistency**
- Unified spacing scale
- Consistent component APIs
- Predictable interaction patterns
- Cohesive visual language

### 4. **Flexibility**
- Theme-aware components (light/dark mode)
- Internationalization support
- Responsive design patterns
- Customizable through CSS variables

## Color System

### Semantic Color Palette

The color system is inspired by Dell's Design System, using semantic naming for clarity and consistency.

#### Primary Colors

- **Informative** (#3b82f6) - Primary actions, links, and informational elements
- **Success** (#22c55e) - Positive states, confirmations, and successful operations
- **Warning** (#f59e0b) - Cautions, pending states, and alerts
- **Error** (#ef4444) - Errors, destructive actions, and critical states
- **Neutral** (#6b7280) - Default states, secondary text, and borders
- **Brand** (#2563eb) - Brand identity and premium features

#### Color Shades

Each semantic color includes 11 shades (50-950) for nuanced design:
- 50-200: Light backgrounds and subtle accents
- 300-400: Medium emphasis elements
- 500-600: Primary usage (default)
- 700-900: High emphasis and dark mode
- 950: Maximum contrast

### Emphasis Levels

Three emphasis levels control visual weight:

1. **Heavy** (100% opacity, high contrast)
   - Primary actions
   - Critical information
   - Active states

2. **Medium** (80% opacity, medium contrast)
   - Secondary information
   - Hover states
   - Subtle emphasis

3. **Light** (10% opacity, low contrast)
   - Backgrounds
   - Disabled states
   - Decorative elements

## Typography

### Font Stack

```css
--font-inter: 'Inter', 'sans-serif';      /* Primary font */
--font-manrope: 'Manrope', 'sans-serif';  /* Display font */
```

### Type Scale

- **Display**: 3xl (30px) - Page titles
- **Heading 1**: 2xl (24px) - Section headers
- **Heading 2**: xl (20px) - Subsections
- **Heading 3**: lg (18px) - Card titles
- **Body**: base (16px) - Default text
- **Small**: sm (14px) - Secondary text
- **Caption**: xs (12px) - Labels, metadata

### Font Weights

- **Bold** (700) - Headings, emphasis
- **Semibold** (600) - Subheadings
- **Medium** (500) - Interactive elements
- **Regular** (400) - Body text

## Spacing System

### Base Unit

The spacing system uses a base unit of 4px with a scale:

```css
--radius: 0.625rem;         /* 10px - Default border radius */
--radius-sm: 0.375rem;      /* 6px */
--radius-md: 0.5rem;        /* 8px */
--radius-lg: 0.625rem;      /* 10px */
--radius-xl: 0.875rem;      /* 14px */
```

### Spacing Scale

- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)

## Components

### Badge Component

The Badge is a versatile component for displaying status, labels, and metadata.

#### Variants
- `informative` - Information and neutral states
- `success` - Positive states and confirmations
- `warning` - Cautions and alerts
- `error` - Errors and critical states
- `neutral` - Default and secondary states
- `brand` - Brand-specific elements

#### Sizes
- `sm` - 10px font, compact padding
- `md` - 12px font, standard padding (default)
- `lg` - 14px font, generous padding
- `dot` - 8px indicator dot
- `microdot` - 6px indicator dot

#### Emphasis
- `heavy` - Solid background, high contrast
- `medium` - Semi-transparent, medium contrast
- `light` - Subtle background, low contrast

#### Usage Examples

```tsx
// Status indicators
<Badge variant="success" emphasis="heavy">Active</Badge>
<Badge variant="warning" emphasis="medium">Pending</Badge>
<Badge variant="error" emphasis="light">Offline</Badge>

// Size variations
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Dot indicators
<Badge variant="success" size="dot" />
<Badge variant="error" size="microdot" />
```

### Button Component

Buttons follow a consistent pattern with clear visual hierarchy.

#### Variants
- `default` - Primary actions
- `secondary` - Secondary actions
- `outline` - Tertiary actions
- `ghost` - Minimal emphasis
- `destructive` - Dangerous actions
- `link` - Navigation style

#### Sizes
- `sm` - Compact
- `md` - Default
- `lg` - Prominent

### Status Badge

Specialized badge for user and organization statuses.

#### Status Types
- `active` - Green, operational
- `inactive` - Gray, dormant
- `suspended` - Red, blocked
- `invited` - Blue, pending

#### Features
- Optional icon display
- Consistent styling
- Accessible labels

### Calendar Component

Advanced calendar with event management capabilities.

#### Event Types
- `class` - Educational sessions
- `meeting` - Meetings and discussions
- `appointment` - One-on-one sessions
- `deadline` - Due dates
- `tournament` - Competitive events
- `holiday` - Breaks and holidays
- `personal` - Personal events
- `scrimmage` - Practice sessions

#### Event Statuses
- `confirmed` - Solid styling
- `tentative` - Dashed borders
- `cancelled` - Strikethrough
- `completed` - Muted colors
- `pending` - Warning colors

### Loading States

Multiple loading patterns for different contexts:

1. **Spinner** - Circular progress indicator
2. **Skeleton** - Content placeholder
3. **Dots** - Inline loading indicator

## Patterns

### Form Patterns

#### Input Fields
- Clear labels above inputs
- Helper text below inputs
- Error messages with red emphasis
- Required field indicators (*)

#### Form Sections
- Logical grouping with cards
- Clear section headers
- Progressive disclosure
- Submit/cancel button placement

#### Validation
- Real-time validation feedback
- Clear error messages
- Success confirmations
- Field-level and form-level errors

### Delete Confirmation

Type-to-confirm pattern for destructive actions:
- Clear warning message
- Type exact text to confirm
- Disabled button until confirmed
- Cancel option always available

### Import/Export

Consistent patterns for data operations:
- Clear file type indicators
- Progress tracking
- Error handling
- Success notifications

## Theme Implementation

### CSS Variables

The design system uses CSS custom properties for theming:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  /* ... more variables */
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);
  /* ... more variables */
}
```

### OKLCH Color Space

We use OKLCH for precise color control:
- **L**: Lightness (0-1)
- **C**: Chroma (color intensity)
- **H**: Hue (color angle)

Benefits:
- Perceptually uniform
- Better color interpolation
- Predictable contrast ratios

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Visible focus indicators
- Logical tab order
- Skip links where appropriate

### Screen Readers

- Semantic HTML structure
- ARIA labels where needed
- Meaningful alt text
- Status announcements

## Responsive Design

### Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Mobile Considerations

- Touch-friendly targets (44x44px minimum)
- Simplified navigation
- Stacked layouts
- Optimized font sizes

## Best Practices

### Component Usage

1. **Use semantic variants** - Choose variants based on meaning, not appearance
2. **Consistent sizing** - Use the same size for related elements
3. **Appropriate emphasis** - Reserve heavy emphasis for primary actions
4. **Accessible combinations** - Ensure color contrast requirements

### Performance

1. **Lazy load components** - Use dynamic imports for heavy components
2. **Optimize images** - Use appropriate formats and sizes
3. **Minimize re-renders** - Use React.memo and proper state management
4. **Bundle splitting** - Separate vendor and app bundles

### Maintainability

1. **Follow patterns** - Use established patterns for consistency
2. **Document changes** - Update this guide when adding patterns
3. **Test thoroughly** - Include visual regression tests
4. **Review regularly** - Audit component usage quarterly

## Implementation Examples

### Creating a New Feature

```tsx
// Use consistent spacing and components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function FeatureCard({ feature }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{feature.name}</CardTitle>
        <Badge variant={feature.status === 'active' ? 'success' : 'neutral'}>
          {feature.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{feature.description}</p>
        <div className="flex gap-2">
          <Button>Primary Action</Button>
          <Button variant="outline">Secondary</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Implementing Dark Mode

```tsx
// Components automatically adapt to theme
function ThemeAwareComponent() {
  return (
    <div className="bg-background text-foreground">
      <h1 className="text-2xl font-bold">Adapts to theme</h1>
      <p className="text-muted-foreground">Secondary text</p>
      <Badge variant="brand">Theme aware</Badge>
    </div>
  )
}
```

## Resources

- **Component Library**: `/admin/design-system` - Live component showcase
- **Theme Configuration**: `src/lib/theme-colors.ts` - Color definitions
- **CSS Variables**: `src/index.css` - Theme implementation
- **Component Source**: `src/components/ui/` - Component implementations

## Future Enhancements

1. **Motion Design** - Animation guidelines and utilities
2. **Icon System** - Comprehensive icon library
3. **Data Visualization** - Chart color schemes and patterns
4. **Advanced Patterns** - Complex interaction patterns
5. **Design Tokens** - Expanded token system for all properties

---

This design guide is a living document. As the design system evolves, this guide should be updated to reflect new patterns, components, and best practices.