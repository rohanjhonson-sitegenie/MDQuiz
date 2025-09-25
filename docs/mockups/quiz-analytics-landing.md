# Quiz Analytics Landing Page - Mockup Design

## Overview
Landing page for quiz analytics showing all quizzes in a card grid layout, similar to Google Forms list view.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊  Quiz Analytics                                                      │
│      View detailed reports and analytics for your quizzes               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │  JavaScript Fundamentals │  │  React Best Practices    │            │
│  │  Published               │  │  Draft                   │            │
│  │                          │  │                          │            │
│  │  Test your knowledge of  │  │  Advanced React patterns │            │
│  │  core JavaScript con...  │  │  and performance opt...  │            │
│  │                          │  │                          │            │
│  │  👥 Analytics Available  │  │  👥 Analytics Available  │            │
│  │                          │  │                          │            │
│  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │            │
│  │  │  View Reports      │  │  │  │  View Reports      │  │            │
│  │  └────────────────────┘  │  │  └────────────────────┘  │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
│                                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │  CSS Grid Mastery        │  │  TypeScript Deep Dive    │            │
│  │  Published               │  │  Published               │            │
│  │                          │  │                          │            │
│  │  Master CSS Grid layout  │  │  Comprehensive TypeSc... │            │
│  │  with practical exam... │  │  covering all key con... │            │
│  │                          │  │                          │            │
│  │  👥 Analytics Available  │  │  👥 Analytics Available  │            │
│  │                          │  │                          │            │
│  │  ┌────────────────────┐  │  │  ┌────────────────────┐  │            │
│  │  │  View Reports      │  │  │  │  View Reports      │  │            │
│  │  └────────────────────┘  │  │  └────────────────────┘  │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. **Page Header**
- Icon: BarChart3 (📊)
- Title: "Quiz Analytics" (text-3xl font-bold)
- Subtitle: "View detailed reports and analytics for your quizzes" (text-muted-foreground)
- Spacing: mb-8 gap-3

### 2. **Quiz Cards Grid**
- Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Card hover effect: `hover:shadow-lg transition-shadow`
- Card structure: Flexbox column with `flex flex-col`

### 3. **Individual Quiz Card Structure**

```
┌──────────────────────────────┐
│  [Title]          [Badge]    │  ← CardHeader with flex justify-between
│                               │
│  [Description - 2 lines max]  │  ← text-sm text-muted-foreground line-clamp-2
│                               │
│  ─────────────────────────── │  ← CardContent with pt-0
│                               │
│  👥 Analytics Available       │  ← flex items-center gap-2
│                               │
│  ┌─────────────────────────┐ │  ← Button full width
│  │    View Reports         │ │
│  └─────────────────────────┘ │
└──────────────────────────────┘
```

**CardHeader:**
- Top row: Quiz title (text-lg) + Badge (Published/Draft)
- Description: 2 lines max with `line-clamp-2`
- `className="flex-1"` to push footer to bottom

**CardContent (Footer):**
- `className="pt-0"` for tight spacing
- Analytics indicator: Users icon + "Analytics Available" text
- Spacing: `space-y-3` between indicator and button
- Button: Full width `size="sm" className="w-full"`

### 4. **Empty State** (No Quizzes)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                          📄                                               │
│                                                                           │
│                   No Quizzes Found                                        │
│                                                                           │
│         Create some quizzes first to view their analytics                │
│                   and reports.                                            │
│                                                                           │
│                ┌────────────────────────────┐                            │
│                │  Go to Quiz Management     │                            │
│                └────────────────────────────┘                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Card States

### Published Quiz Card:
- Badge: `variant="default"` (solid primary color)
- Text: "Published"
- Fully interactive, click View Reports to see analytics

### Draft Quiz Card:
- Badge: `variant="secondary"` (muted background)
- Text: "Draft"
- Analytics still available for drafts
- View Reports button enabled

### Loading State:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[...Array(6)].map((_, i) => (
    <Card key={i} className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-full"></div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

## Interaction Patterns

### Card Interactions:
1. **Hover**: Shadow elevation increases (`hover:shadow-lg`)
2. **Click "View Reports"**: Navigate to `/admin/quiz-analytics/{quizId}`
3. **Entire card clickable**: Optional - could make whole card clickable area

### Navigation:
- From sidebar: "Quiz Analytics" menu item
- From quiz management: "View Analytics" button on each quiz

---

## Data Display Rules

### Title:
- Display full title (no truncation in header)
- Font: text-lg font-medium

### Description:
- Max 2 lines with `line-clamp-2`
- Show ellipsis (...) for overflow
- If no description: Don't render the paragraph element

### Badge:
- Published: Green/primary variant
- Draft: Gray/secondary variant
- Always show status

### Analytics Indicator:
- Always show "Analytics Available" even for 0 responses
- Icon: Users (lucide-react)
- Text size: text-sm
- Color: text-muted-foreground

---

## Responsive Behavior

### Desktop (≥1024px):
- 3 columns: `lg:grid-cols-3`
- Card width: ~360px each
- Full descriptions visible (2 lines)

### Tablet (768px - 1024px):
- 2 columns: `md:grid-cols-2`
- Card width: ~400px each

### Mobile (<768px):
- 1 column: `grid-cols-1`
- Full width cards
- Stack vertically

---

## Color & Styling

### Card:
```tsx
className="hover:shadow-lg transition-shadow flex flex-col"
```

### Badge Variants:
```tsx
// Published
<Badge variant="default">Published</Badge>

// Draft
<Badge variant="secondary">Draft</Badge>
```

### Button:
```tsx
<Button asChild size="sm" className="w-full">
  <Link to={`/admin/quiz-analytics/$quizId`} params={{ quizId: quiz.id }}>
    View Reports
  </Link>
</Button>
```

---

## Performance Considerations

### Data Fetching:
- Load quiz metadata only (no questions)
- Use `repository.getQuizzes(false)` - don't include questions
- Cache quiz list in store if navigating back

### Optimization:
- Lazy load analytics data only when View Reports clicked
- Pagination if >50 quizzes (not in MVP)
- Virtual scrolling for 100+ quizzes

---

## Accessibility

### Semantic HTML:
- Use `<Link>` for navigation (keyboard accessible)
- Proper heading hierarchy (h1 for page title)
- Alt text for icons (Users icon)

### Keyboard Navigation:
- Tab through cards in order
- Enter to activate "View Reports" button
- Focus indicators on interactive elements

### Screen Readers:
- Badge announces status
- Link describes action: "View Reports for [Quiz Title]"

---

## Implementation Checklist

### Current Implementation ✅:
- [x] Page layout structure
- [x] Quiz cards grid (3 columns)
- [x] Title + Badge in header
- [x] Description with line-clamp-2
- [x] Analytics Available label
- [x] View Reports button (parallel to label)
- [x] Empty state with navigation
- [x] Loading state skeleton
- [x] Responsive grid

### Future Enhancements 📋:
- [ ] Search/filter quizzes
- [ ] Sort by: Recent, Title, Response count
- [ ] Quick stats preview on hover (response count)
- [ ] Bulk actions (export multiple quizzes)
- [ ] Category/tag filtering