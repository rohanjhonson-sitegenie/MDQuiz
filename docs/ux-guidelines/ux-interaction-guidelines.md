# UX Interaction Guidelines System

> A comprehensive pattern library for building consistent, accessible, and delightful user experiences.

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Reference](#quick-reference)
3. [Navigation Patterns](#navigation-patterns)
   - [Breadcrumb Navigation](#breadcrumb-navigation)
   - [Back Link](#back-link)
   - [Tabs Navigation](#tabs-navigation)
   - [Side Navigation](#side-navigation)
4. [Layout & Flow Patterns](#layout--flow-patterns)
   - [Stepper](#stepper)
   - [Pagination vs Infinite Scroll](#pagination-vs-infinite-scroll)
   - [Card vs List View](#card-vs-list-view)
5. [Overlay Patterns](#overlay-patterns)
   - [Modal Dialog](#modal-dialog)
   - [Drawer / Sheet](#drawer--sheet)
   - [Popover](#popover)
   - [Tooltip](#tooltip)
6. [Feedback Patterns](#feedback-patterns)
   - [Toast Notifications](#toast-notifications)
   - [Snackbar](#snackbar)
   - [Inline Messages](#inline-messages)
   - [Confirmation vs Undo](#confirmation-vs-undo)
7. [Forms & Validation](#forms--validation)
   - [Form Layout & Structure](#form-layout--structure)
   - [Inline Validation](#inline-validation)
   - [Password Field Patterns](#password-field-patterns)
   - [Error Message Guidelines](#error-message-guidelines)
8. [Responsive & Accessibility](#responsive--accessibility)
   - [Keyboard Navigation](#keyboard-navigation)
   - [Focus Management](#focus-management)
   - [Responsive Design Patterns](#responsive-design-patterns)
   - [Touch Target Guidelines](#touch-target-guidelines)
9. [Integration Guide](#integration-guide)
10. [Resources](#resources)

## Introduction

This guide provides detailed patterns and best practices for common UX interactions. Each pattern includes:

- **When to use** and **when NOT to use** guidelines
- **Best practices** based on industry standards
- **Code examples** using React and modern web standards
- **Accessibility requirements** meeting WCAG 2.1 AA standards
- **Decision trees** to help choose the right pattern

## Quick Reference

### Common Decisions

| Need | Options | Recommendation |
|------|---------|----------------|
| Show location in site | Breadcrumb vs Back Link | **Breadcrumb** for hierarchy, **Back Link** for linear flows |
| Display feedback | Toast vs Modal vs Inline | **Toast** for confirmations, **Modal** for critical, **Inline** for context |
| Load more content | Pagination vs Infinite Scroll | **Pagination** for search/reference, **Infinite** for browsing |
| Show extra content | Modal vs Drawer vs Popover | **Modal** for focus, **Drawer** for tools, **Popover** for quick info |
| Validate forms | Real-time vs On Blur vs On Submit | **On Blur** for most fields, **Real-time** for passwords |

## Navigation Patterns

### Breadcrumb Navigation

**Purpose:** Shows users their current location within a hierarchical structure and provides a path back to higher levels.

#### When to Use
- Hierarchical sites with 3+ levels
- E-commerce category navigation  
- Documentation sites
- File/folder structures

#### When NOT to Use
- Flat site structures
- Mobile-first applications (limited space)
- Single-level navigation
- As primary navigation

#### Best Practices
1. **Start with Home or Root** - Always begin with the highest level
2. **Current Page Not Clickable** - The last item should be text only
3. **Use Consistent Separators** - Stick with chevrons (›) or slashes (/)
4. **Truncate Long Paths** - Show first 2 and last 2 levels with "..." for very deep hierarchies

#### Code Example
```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/products">Products</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Smartphones</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

#### Accessibility
- Use proper ARIA labels
- Ensure keyboard navigation works
- Mark current page with `aria-current="page"`
- Screen readers should announce the full path

### Back Link

**Purpose:** Provides a clear way to return to the previous page or step, with explicit context about destination.

#### When to Use
- Detail pages from lists
- Multi-step forms/wizards
- Modal-like full pages
- Deep-dive content pages
- Mobile navigation patterns

#### When NOT to Use
- Home or landing pages
- Multiple entry points exist
- Browser back works differently
- Complex navigation paths

#### Best Practices
1. **Use Descriptive Labels** - "Back to [Context]" not just "Back"
2. **Position Consistently** - Top-left is standard, before page title
3. **Don't Rely on Browser Back** - In SPAs, browser back might not match expectations

#### Code Example
```tsx
<Button variant="ghost" onClick={() => router.back()}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back to Dashboard
</Button>
```

### Tabs Navigation

**Purpose:** Organizes related content into distinct sections, allowing quick switching without leaving the page.

#### When to Use
- 2-7 related content sections
- User needs quick comparison
- Content is mutually exclusive
- Reducing cognitive load

#### When NOT to Use
- Sequential content/steps (use Stepper)
- More than 7 tabs needed
- Tabs require scrolling
- On mobile (consider accordion)

#### Code Example
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="analytics">Analytics content</TabsContent>
  <TabsContent value="settings">Settings content</TabsContent>
</Tabs>
```

## Layout & Flow Patterns

### Stepper

**Purpose:** Guides users through multi-step workflows by breaking complex tasks into manageable chunks.

#### When to Use
- Forms with 3+ logical sections
- Onboarding flows
- Checkout processes
- Configuration wizards

#### When NOT to Use
- Simple forms (use sections instead)
- Non-linear processes
- Optional/skippable content
- Mobile screens (limited space)

#### Best Practices
1. **Show Clear Progress** - Users should always know where they are
2. **Allow Backward Navigation** - Let users go back to change answers
3. **Save Progress Automatically** - Don't lose data between steps
4. **Validate Before Proceeding** - Check each step before moving forward

### Pagination vs Infinite Scroll

#### Pagination
**Best for:** Search results, e-commerce catalogs, data tables

**Advantages:**
- Clear sense of content scope
- Easy to bookmark/share pages
- Better performance
- SEO-friendly

**Code Example:**
```tsx
<Pagination>
  <PaginationContent>
    <PaginationPrevious href="#" />
    <PaginationLink href="#">1</PaginationLink>
    <PaginationLink href="#" isActive>2</PaginationLink>
    <PaginationLink href="#">3</PaginationLink>
    <PaginationNext href="#" />
  </PaginationContent>
</Pagination>
```

#### Infinite Scroll
**Best for:** Social feeds, image galleries, discovery browsing

**Advantages:**
- Engaging, continuous experience
- No interruption to browsing
- Great for touch devices
- Reduces decision fatigue

**Code Example:**
```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
});

<IntersectionObserver onIntersect={fetchNextPage}>
  {data.pages.map(page => page.items.map(item => 
    <ItemCard key={item.id} {...item} />
  ))}
</IntersectionObserver>
```

## Overlay Patterns

### Modal Dialog

**Purpose:** Demands immediate attention by blocking interaction with the rest of the page.

#### When to Use
- Confirmations for destructive actions
- Complex forms requiring focus
- Terms acceptance or legal content
- Error states requiring resolution

#### When NOT to Use
- Non-critical information
- Frequently accessed tools
- Mobile-first interfaces
- Marketing/promotional content

#### Best Practices
1. **Include Close Options** - X button, Cancel button, and Escape key
2. **Focus Management** - Trap focus within, return to trigger on close
3. **Avoid Modal Stacking** - Never open a modal from another modal

### Drawer / Sheet

**Purpose:** Slides in from screen edge, maintaining context while providing focused space.

#### When to Use
- Navigation menus on mobile
- Filter and sort controls
- Settings panels
- Shopping carts

#### Positioning Guide
- **Left:** Navigation menus, app sidebars
- **Right:** Settings, filters, shopping carts
- **Bottom:** Mobile actions, share sheets
- **Top:** Notifications (rarely used)

### Popover

**Purpose:** Displays rich content in a floating panel anchored to trigger element.

#### When to Use
- Inline editing forms
- Extended information
- Quick actions menus
- Color/emoji pickers

#### When NOT to Use
- Simple text hints (use tooltip)
- Critical actions
- Large content areas
- Mobile interfaces

### Tooltip

**Purpose:** Provides brief, contextual information on hover or focus.

#### When to Use
- Icon button labels
- Truncated text expansion
- Keyboard shortcuts
- Form field hints

#### When NOT to Use
- Essential information
- Interactive content
- Long explanations
- Touch-only interfaces

## Feedback Patterns

### Toast Notifications

**Purpose:** Brief, non-intrusive feedback about an action or system event.

#### When to Use
- Action confirmations (saved, sent, deleted)
- Background process updates
- Non-critical errors
- Actions with undo option

#### Best Practices
- **Position:** Top-right for desktop, bottom for mobile
- **Duration:** 3-5 seconds for simple messages
- **Stacking:** Show max 3-5 at once, queue others

### Confirmation vs Undo

| Pattern | Confirmation | Undo |
|---------|--------------|------|
| **Approach** | Ask before acting | Act immediately, allow reversal |
| **Best For** | Destructive actions, high-cost operations | Reversible actions, frequent operations |
| **User Experience** | Interrupts flow, adds friction | Smooth flow, reduces anxiety |
| **Implementation** | Modal dialog before action | Toast with undo button after |

## Forms & Validation

### Form Layout & Structure

#### Single Column vs Multi-Column
- **Single Column:** Best for mobile, simple forms, natural reading flow
- **Multi-Column:** Only for related fields (first/last name), desktop only

#### Best Practices
1. **Mark Required Fields** - Use asterisk (*) or "required" text
2. **Group Related Fields** - Use fieldset/legend for logical sections
3. **Provide Help Text** - Clarify format requirements upfront

### Inline Validation

#### Validation Timing
- **Real-time:** Password strength, character counters
- **On Blur:** Email validation, required fields
- **On Submit:** Final validation, server-side checks

#### Error Message Guidelines

**Good Error Messages:**
- ✓ "Please enter a valid email address" - Clear and actionable
- ✓ "Password must be at least 8 characters" - Specific requirement

**Poor Error Messages:**
- ✗ "Invalid input" - Too vague
- ✗ "Error: 422" - Technical jargon

### Password Field Patterns

#### Do:
- Show/hide password toggle
- Real-time strength indicator
- Clear requirements upfront
- Allow paste functionality
- Support password managers

#### Don't:
- Disable paste
- Hide requirements until error
- Use confusing rules
- Show password by default

## Responsive & Accessibility

### Keyboard Navigation

All interactive elements must be keyboard accessible.

#### Standard Keys
- **Tab** - Navigate forward
- **Shift+Tab** - Navigate backward
- **Enter** - Activate buttons/links
- **Space** - Toggle checkboxes, buttons
- **Escape** - Close modals/menus
- **Arrow Keys** - Navigate within components

### Focus Management

#### Principles
1. **Focus Trapping** - Modals and drawers trap focus within
2. **Focus Restoration** - Return focus to trigger on close
3. **Route Changes** - Move focus to main content in SPAs

### Responsive Design Patterns

#### Breakpoints
- **Mobile (<768px):** Single column, full-width buttons, 44px touch targets
- **Tablet (768-1024px):** 2 columns, collapsible sidebars, adaptive spacing
- **Desktop (>1024px):** Multi-column, persistent sidebars, hover interactions

### Touch Target Guidelines

#### Minimum Sizes
- **iOS:** 44×44 px minimum
- **Material Design:** 48×48 dp minimum
- **Spacing:** 8px minimum between targets

## Integration Guide

### Storybook Integration
1. Install Storybook for React
2. Create stories for each pattern
3. Add accessibility addon
4. Configure controls for variants

### Docusaurus Integration
1. Initialize Docusaurus project
2. Import pattern markdown files
3. Configure navigation
4. Add search functionality

### Design System Tools
- **Figma/Sketch:** Sync design tokens
- **Zeroheight:** Documentation platform
- **Chromatic:** Visual regression testing

## Resources

### Further Reading
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)
- [Human Interface Guidelines](https://developer.apple.com/design/)
- [Carbon Design System](https://www.carbondesignsystem.com/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [Stark](https://www.getstark.co/) - Design accessibility tools

---

*This guide is a living document. Contribute improvements and new patterns via pull requests.*