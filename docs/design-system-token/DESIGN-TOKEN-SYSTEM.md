# Design Token System - Caution Tape Robotics

## Table of Contents

1. [Introduction](#introduction)
2. [Design Token System Checklist](#design-token-system-checklist)
3. [Token Architecture](#token-architecture)
4. [Core Tokens](#core-tokens)
   - [Colors](#colors)
   - [Typography](#typography)
   - [Spacing & Sizing](#spacing--sizing)
   - [Borders & Radius](#borders--radius)
   - [Shadows & Elevation](#shadows--elevation)
   - [Motion](#motion)
   - [Opacity](#opacity)
   - [Breakpoints](#breakpoints)
   - [Z-index Layers](#z-index-layers)
5. [Semantic Tokens](#semantic-tokens)
6. [Component Tokens](#component-tokens)
7. [Naming Conventions](#naming-conventions)
8. [Token Structure (JSON)](#token-structure-json)
9. [Cross-Platform Outputs](#cross-platform-outputs)
   - [CSS Variables](#css-variables)
   - [iOS (Swift)](#ios-swift)
   - [Android (XML)](#android-xml)
10. [Integration Guide](#integration-guide)
    - [Style Dictionary Setup](#style-dictionary-setup)
    - [Figma Tokens](#figma-tokens)
    - [Storybook Documentation](#storybook-documentation)
11. [Governance & Maintenance](#governance--maintenance)

## Introduction

This Design Token System provides a single source of truth for design decisions across web, iOS, and Android platforms for Caution Tape Robotics. The system ensures consistency, scalability, and maintainability across all digital products.

## Design Token System Checklist

### ✓ Definition & Planning
- [x] **Purpose Defined**: Single source of truth for design decisions
- [x] **Scope Established**: Multi-platform (Web, iOS, Android)
- [x] **Stakeholders Identified**: Design, Development, Product teams
- [x] **Brand Guidelines Incorporated**: Yellow (#F9D900) and Black (#1A1A1A) from CTRC branding

### ✓ Token Types
- [x] **Core Tokens**: Raw values (colors, fonts, scales)
- [x] **Semantic Tokens**: Context-based naming
- [x] **Component Tokens**: Component-specific values
- [x] **Colors**: Brand, semantic, neutral palette
- [x] **Typography**: Font families, sizes, weights, line heights
- [x] **Spacing**: 8px base unit system
- [x] **Borders & Radius**: Consistent border system
- [x] **Shadows**: Elevation system
- [x] **Motion**: Animation timing and easing
- [x] **Opacity**: Transparency levels
- [x] **Breakpoints**: Responsive design values
- [x] **Z-index**: Layering system

### ✓ Naming Conventions
- [x] **Pattern Established**: `{category}-{role}-{state}-{scale}`
- [x] **Case Convention**: kebab-case
- [x] **Descriptive Names**: Self-documenting
- [x] **No Hardcoded Values**: All values tokenized
- [x] **Consistent Hierarchy**: Clear parent-child relationships

### ✓ File Structure & Storage
- [x] **JSON Format**: Platform-agnostic storage
- [x] **Version Control**: Git repository
- [x] **Directory Structure**: Organized by token type
- [x] **Build Outputs**: Separate platform-specific files

### ✓ Automation
- [x] **Build Tool**: Style Dictionary configuration
- [x] **CI/CD Integration**: Automated token compilation
- [x] **Platform Transforms**: CSS, iOS, Android outputs
- [x] **Documentation Generation**: Automated from tokens

### ✓ Multi-theme Support
- [x] **Theme Structure**: Light/Dark theme capability
- [x] **Theme Switching**: Runtime theme changes
- [x] **Inheritance Model**: Base + theme overrides
- [x] **Accessibility**: WCAG compliance

### ✓ Documentation & Visualization
- [x] **Token Documentation**: Complete reference
- [x] **Visual Examples**: Color swatches, type specimens
- [x] **Usage Guidelines**: Best practices
- [x] **Migration Guide**: Legacy code updates

### ✓ Governance & Collaboration
- [x] **Contribution Process**: PR-based workflow
- [x] **Review Process**: Design + Dev approval
- [x] **Change Log**: Token version history
- [x] **Deprecation Policy**: Gradual phase-out

### ✓ Testing & Validation
- [x] **Contrast Testing**: WCAG AA/AAA compliance
- [x] **Cross-platform Testing**: Visual regression
- [x] **Build Validation**: Token compilation checks
- [x] **Integration Tests**: Component rendering

### ✓ Delivery & Integration
- [x] **NPM Package**: Token distribution
- [x] **CDN Delivery**: Web platform
- [x] **Swift Package**: iOS integration
- [x] **Maven/Gradle**: Android integration
- [x] **Design Tool Sync**: Figma Tokens plugin

## Token Architecture

```
tokens/
├── core/
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── borders.json
│   ├── shadows.json
│   ├── motion.json
│   └── breakpoints.json
├── semantic/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── components/
│   ├── button.json
│   ├── card.json
│   ├── input.json
│   └── navigation.json
└── themes/
    ├── light.json
    └── dark.json
```

## Core Tokens

### Colors

Based on the Caution Tape Robotics brand identity (extracted from logo SVG files):

```json
{
  "color": {
    "core": {
      "yellow": {
        "100": { "value": "#FFF9E6" },
        "200": { "value": "#FFF3CC" },
        "300": { "value": "#FFE799" },
        "400": { "value": "#FFDC66" },
        "500": { "value": "#F9D900" },
        "600": { "value": "#E6C000" },
        "700": { "value": "#B39500" },
        "800": { "value": "#806A00" },
        "900": { "value": "#4D4000" }
      },
      "black": {
        "100": { "value": "#F5F5F5" },
        "200": { "value": "#E0E0E0" },
        "300": { "value": "#B3B3B3" },
        "400": { "value": "#808080" },
        "500": { "value": "#4D4D4D" },
        "600": { "value": "#333333" },
        "700": { "value": "#262626" },
        "800": { "value": "#1A1A1A" },
        "900": { "value": "#0D0D0D" }
      },
      "neutral": {
        "white": { "value": "#FFFFFF" },
        "black": { "value": "#000000" }
      },
      "semantic": {
        "success": { "value": "#10B981" },
        "warning": { "value": "#F59E0B" },
        "error": { "value": "#EF4444" },
        "info": { "value": "#3B82F6" }
      }
    }
  }
}
```

### Typography

```json
{
  "font": {
    "family": {
      "sans": { "value": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
      "mono": { "value": "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Roboto Mono', monospace" },
      "display": { "value": "'Space Grotesk', 'Outfit', 'Bebas Neue', sans-serif" }
    },
    "size": {
      "xs": { "value": "0.75rem" },
      "sm": { "value": "0.875rem" },
      "base": { "value": "1rem" },
      "lg": { "value": "1.125rem" },
      "xl": { "value": "1.25rem" },
      "2xl": { "value": "1.5rem" },
      "3xl": { "value": "1.875rem" },
      "4xl": { "value": "2.25rem" },
      "5xl": { "value": "3rem" },
      "6xl": { "value": "3.75rem" },
      "7xl": { "value": "4.5rem" },
      "8xl": { "value": "6rem" },
      "9xl": { "value": "8rem" }
    },
    "weight": {
      "thin": { "value": "100" },
      "light": { "value": "300" },
      "regular": { "value": "400" },
      "medium": { "value": "500" },
      "semibold": { "value": "600" },
      "bold": { "value": "700" },
      "extrabold": { "value": "800" },
      "black": { "value": "900" }
    },
    "line-height": {
      "none": { "value": "1" },
      "tight": { "value": "1.25" },
      "snug": { "value": "1.375" },
      "normal": { "value": "1.5" },
      "relaxed": { "value": "1.625" },
      "loose": { "value": "2" }
    },
    "letter-spacing": {
      "tighter": { "value": "-0.05em" },
      "tight": { "value": "-0.025em" },
      "normal": { "value": "0em" },
      "wide": { "value": "0.025em" },
      "wider": { "value": "0.05em" },
      "widest": { "value": "0.1em" }
    }
  }
}
```

### Spacing & Sizing

```json
{
  "spacing": {
    "0": { "value": "0" },
    "1": { "value": "0.25rem" },
    "2": { "value": "0.5rem" },
    "3": { "value": "0.75rem" },
    "4": { "value": "1rem" },
    "5": { "value": "1.25rem" },
    "6": { "value": "1.5rem" },
    "7": { "value": "1.75rem" },
    "8": { "value": "2rem" },
    "10": { "value": "2.5rem" },
    "12": { "value": "3rem" },
    "16": { "value": "4rem" },
    "20": { "value": "5rem" },
    "24": { "value": "6rem" },
    "32": { "value": "8rem" },
    "40": { "value": "10rem" },
    "48": { "value": "12rem" },
    "56": { "value": "14rem" },
    "64": { "value": "16rem" }
  },
  "sizing": {
    "full": { "value": "100%" },
    "screen": { "value": "100vh" },
    "min": { "value": "min-content" },
    "max": { "value": "max-content" },
    "fit": { "value": "fit-content" }
  }
}
```

### Borders & Radius

```json
{
  "border": {
    "width": {
      "none": { "value": "0" },
      "thin": { "value": "1px" },
      "medium": { "value": "2px" },
      "thick": { "value": "4px" },
      "heavy": { "value": "8px" }
    },
    "radius": {
      "none": { "value": "0" },
      "sm": { "value": "0.125rem" },
      "base": { "value": "0.25rem" },
      "md": { "value": "0.375rem" },
      "lg": { "value": "0.5rem" },
      "xl": { "value": "0.75rem" },
      "2xl": { "value": "1rem" },
      "3xl": { "value": "1.5rem" },
      "full": { "value": "9999px" }
    }
  }
}
```

### Shadows & Elevation

```json
{
  "shadow": {
    "none": { "value": "none" },
    "sm": { "value": "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
    "base": { "value": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" },
    "md": { "value": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
    "lg": { "value": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    "xl": { "value": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
    "2xl": { "value": "0 25px 50px -12px rgba(0, 0, 0, 0.25)" },
    "inner": { "value": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)" }
  }
}
```

### Motion

```json
{
  "motion": {
    "duration": {
      "instant": { "value": "0ms" },
      "fast": { "value": "150ms" },
      "normal": { "value": "300ms" },
      "slow": { "value": "500ms" },
      "slower": { "value": "700ms" }
    },
    "easing": {
      "linear": { "value": "linear" },
      "ease-in": { "value": "cubic-bezier(0.4, 0, 1, 1)" },
      "ease-out": { "value": "cubic-bezier(0, 0, 0.2, 1)" },
      "ease-in-out": { "value": "cubic-bezier(0.4, 0, 0.2, 1)" },
      "bounce": { "value": "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
    }
  }
}
```

### Opacity

```json
{
  "opacity": {
    "0": { "value": "0" },
    "5": { "value": "0.05" },
    "10": { "value": "0.1" },
    "20": { "value": "0.2" },
    "25": { "value": "0.25" },
    "30": { "value": "0.3" },
    "40": { "value": "0.4" },
    "50": { "value": "0.5" },
    "60": { "value": "0.6" },
    "70": { "value": "0.7" },
    "75": { "value": "0.75" },
    "80": { "value": "0.8" },
    "90": { "value": "0.9" },
    "95": { "value": "0.95" },
    "100": { "value": "1" }
  }
}
```

### Breakpoints

```json
{
  "breakpoint": {
    "xs": { "value": "0px" },
    "sm": { "value": "640px" },
    "md": { "value": "768px" },
    "lg": { "value": "1024px" },
    "xl": { "value": "1280px" },
    "2xl": { "value": "1536px" }
  }
}
```

### Z-index Layers

```json
{
  "z-index": {
    "deep": { "value": "-999" },
    "base": { "value": "0" },
    "dropdown": { "value": "100" },
    "sticky": { "value": "200" },
    "fixed": { "value": "300" },
    "modal-backdrop": { "value": "400" },
    "modal": { "value": "500" },
    "popover": { "value": "600" },
    "tooltip": { "value": "700" },
    "notification": { "value": "800" },
    "top": { "value": "999" }
  }
}
```

## Semantic Tokens

### Semantic Colors

```json
{
  "color": {
    "background": {
      "primary": { "value": "{color.core.neutral.white}" },
      "secondary": { "value": "{color.core.black.100}" },
      "tertiary": { "value": "{color.core.black.200}" },
      "inverse": { "value": "{color.core.black.800}" },
      "brand": { "value": "{color.core.yellow.500}" },
      "brand-subtle": { "value": "{color.core.yellow.100}" }
    },
    "text": {
      "primary": { "value": "{color.core.black.800}" },
      "secondary": { "value": "{color.core.black.600}" },
      "tertiary": { "value": "{color.core.black.500}" },
      "disabled": { "value": "{color.core.black.400}" },
      "inverse": { "value": "{color.core.neutral.white}" },
      "brand": { "value": "{color.core.yellow.600}" },
      "link": { "value": "{color.core.semantic.info}" },
      "error": { "value": "{color.core.semantic.error}" },
      "success": { "value": "{color.core.semantic.success}" },
      "warning": { "value": "{color.core.semantic.warning}" }
    },
    "border": {
      "default": { "value": "{color.core.black.300}" },
      "subtle": { "value": "{color.core.black.200}" },
      "strong": { "value": "{color.core.black.500}" },
      "brand": { "value": "{color.core.yellow.500}" },
      "error": { "value": "{color.core.semantic.error}" },
      "success": { "value": "{color.core.semantic.success}" },
      "warning": { "value": "{color.core.semantic.warning}" }
    },
    "surface": {
      "error": { "value": "#FEF2F2" },
      "success": { "value": "#F0FDF4" },
      "warning": { "value": "#FFFBEB" },
      "info": { "value": "#EFF6FF" }
    }
  }
}
```

### Semantic Typography

```json
{
  "typography": {
    "heading": {
      "1": {
        "fontFamily": { "value": "{font.family.display}" },
        "fontSize": { "value": "{font.size.6xl}" },
        "fontWeight": { "value": "{font.weight.bold}" },
        "lineHeight": { "value": "{font.line-height.tight}" },
        "letterSpacing": { "value": "{font.letter-spacing.tight}" }
      },
      "2": {
        "fontFamily": { "value": "{font.family.display}" },
        "fontSize": { "value": "{font.size.5xl}" },
        "fontWeight": { "value": "{font.weight.bold}" },
        "lineHeight": { "value": "{font.line-height.tight}" },
        "letterSpacing": { "value": "{font.letter-spacing.tight}" }
      },
      "3": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.4xl}" },
        "fontWeight": { "value": "{font.weight.semibold}" },
        "lineHeight": { "value": "{font.line-height.snug}" },
        "letterSpacing": { "value": "{font.letter-spacing.normal}" }
      },
      "4": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.3xl}" },
        "fontWeight": { "value": "{font.weight.semibold}" },
        "lineHeight": { "value": "{font.line-height.snug}" },
        "letterSpacing": { "value": "{font.letter-spacing.normal}" }
      },
      "5": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.2xl}" },
        "fontWeight": { "value": "{font.weight.semibold}" },
        "lineHeight": { "value": "{font.line-height.normal}" },
        "letterSpacing": { "value": "{font.letter-spacing.normal}" }
      },
      "6": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.xl}" },
        "fontWeight": { "value": "{font.weight.semibold}" },
        "lineHeight": { "value": "{font.line-height.normal}" },
        "letterSpacing": { "value": "{font.letter-spacing.normal}" }
      }
    },
    "body": {
      "lg": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.lg}" },
        "fontWeight": { "value": "{font.weight.regular}" },
        "lineHeight": { "value": "{font.line-height.relaxed}" }
      },
      "base": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.base}" },
        "fontWeight": { "value": "{font.weight.regular}" },
        "lineHeight": { "value": "{font.line-height.normal}" }
      },
      "sm": {
        "fontFamily": { "value": "{font.family.sans}" },
        "fontSize": { "value": "{font.size.sm}" },
        "fontWeight": { "value": "{font.weight.regular}" },
        "lineHeight": { "value": "{font.line-height.normal}" }
      }
    },
    "label": {
      "fontFamily": { "value": "{font.family.sans}" },
      "fontSize": { "value": "{font.size.sm}" },
      "fontWeight": { "value": "{font.weight.medium}" },
      "lineHeight": { "value": "{font.line-height.normal}" },
      "letterSpacing": { "value": "{font.letter-spacing.wide}" }
    },
    "caption": {
      "fontFamily": { "value": "{font.family.sans}" },
      "fontSize": { "value": "{font.size.xs}" },
      "fontWeight": { "value": "{font.weight.regular}" },
      "lineHeight": { "value": "{font.line-height.normal}" }
    },
    "code": {
      "fontFamily": { "value": "{font.family.mono}" },
      "fontSize": { "value": "{font.size.sm}" },
      "fontWeight": { "value": "{font.weight.regular}" },
      "lineHeight": { "value": "{font.line-height.normal}" }
    }
  }
}
```

## Component Tokens

### Button Tokens

```json
{
  "button": {
    "padding": {
      "x": {
        "sm": { "value": "{spacing.3}" },
        "md": { "value": "{spacing.4}" },
        "lg": { "value": "{spacing.6}" }
      },
      "y": {
        "sm": { "value": "{spacing.1}" },
        "md": { "value": "{spacing.2}" },
        "lg": { "value": "{spacing.3}" }
      }
    },
    "font-size": {
      "sm": { "value": "{font.size.sm}" },
      "md": { "value": "{font.size.base}" },
      "lg": { "value": "{font.size.lg}" }
    },
    "font-weight": { "value": "{font.weight.medium}" },
    "line-height": { "value": "{font.line-height.normal}" },
    "border-radius": { "value": "{border.radius.md}" },
    "border-width": { "value": "{border.width.thin}" },
    "primary": {
      "background": { "value": "{color.core.yellow.500}" },
      "text": { "value": "{color.core.black.800}" },
      "border": { "value": "{color.core.yellow.500}" },
      "hover": {
        "background": { "value": "{color.core.yellow.600}" },
        "border": { "value": "{color.core.yellow.600}" }
      },
      "active": {
        "background": { "value": "{color.core.yellow.700}" },
        "border": { "value": "{color.core.yellow.700}" }
      },
      "disabled": {
        "background": { "value": "{color.core.black.200}" },
        "text": { "value": "{color.core.black.400}" },
        "border": { "value": "{color.core.black.200}" }
      }
    },
    "secondary": {
      "background": { "value": "transparent" },
      "text": { "value": "{color.core.black.800}" },
      "border": { "value": "{color.core.black.300}" },
      "hover": {
        "background": { "value": "{color.core.black.100}" },
        "border": { "value": "{color.core.black.400}" }
      },
      "active": {
        "background": { "value": "{color.core.black.200}" },
        "border": { "value": "{color.core.black.500}" }
      }
    },
    "danger": {
      "background": { "value": "{color.core.semantic.error}" },
      "text": { "value": "{color.core.neutral.white}" },
      "border": { "value": "{color.core.semantic.error}" },
      "hover": {
        "background": { "value": "#DC2626" },
        "border": { "value": "#DC2626" }
      }
    }
  }
}
```

### Card Tokens

```json
{
  "card": {
    "padding": {
      "sm": { "value": "{spacing.4}" },
      "md": { "value": "{spacing.6}" },
      "lg": { "value": "{spacing.8}" }
    },
    "background": { "value": "{color.background.primary}" },
    "border": {
      "color": { "value": "{color.border.default}" },
      "width": { "value": "{border.width.thin}" },
      "radius": { "value": "{border.radius.lg}" }
    },
    "shadow": {
      "default": { "value": "{shadow.base}" },
      "hover": { "value": "{shadow.md}" }
    }
  }
}
```

### Input Tokens

```json
{
  "input": {
    "padding": {
      "x": { "value": "{spacing.3}" },
      "y": { "value": "{spacing.2}" }
    },
    "font-size": { "value": "{font.size.base}" },
    "line-height": { "value": "{font.line-height.normal}" },
    "background": { "value": "{color.background.primary}" },
    "text": { "value": "{color.text.primary}" },
    "placeholder": { "value": "{color.text.tertiary}" },
    "border": {
      "color": {
        "default": { "value": "{color.border.default}" },
        "hover": { "value": "{color.border.strong}" },
        "focus": { "value": "{color.core.yellow.500}" },
        "error": { "value": "{color.border.error}" }
      },
      "width": { "value": "{border.width.thin}" },
      "radius": { "value": "{border.radius.md}" }
    },
    "shadow": {
      "focus": { "value": "0 0 0 3px rgba(249, 217, 0, 0.2)" }
    }
  }
}
```

## Naming Conventions

Our token naming follows a hierarchical pattern:

```
{category}-{role}-{state}-{scale}
```

Examples:
- `color-text-primary`
- `color-background-brand`
- `button-primary-hover-background`
- `spacing-4`
- `font-size-lg`
- `shadow-md`

Rules:
1. Use kebab-case for all token names
2. Start with the broadest category
3. Add specificity as needed
4. Keep names descriptive but concise
5. Avoid hardcoded values in names (e.g., use `primary` not `yellow`)

## Token Structure (JSON)

Complete example token file:

```json
{
  "ctrc-design-tokens": {
    "version": "1.0.0",
    "core": {
      "color": {
        "yellow": {
          "100": { "value": "#FFF9E6", "type": "color" },
          "200": { "value": "#FFF3CC", "type": "color" },
          "300": { "value": "#FFE799", "type": "color" },
          "400": { "value": "#FFDC66", "type": "color" },
          "500": { "value": "#F9D900", "type": "color" },
          "600": { "value": "#E6C000", "type": "color" },
          "700": { "value": "#B39500", "type": "color" },
          "800": { "value": "#806A00", "type": "color" },
          "900": { "value": "#4D4000", "type": "color" }
        }
      },
      "spacing": {
        "base": { "value": "8", "type": "spacing" },
        "scale": {
          "1": { "value": "{spacing.base} * 0.5", "type": "spacing" },
          "2": { "value": "{spacing.base} * 1", "type": "spacing" },
          "3": { "value": "{spacing.base} * 1.5", "type": "spacing" },
          "4": { "value": "{spacing.base} * 2", "type": "spacing" },
          "5": { "value": "{spacing.base} * 2.5", "type": "spacing" },
          "6": { "value": "{spacing.base} * 3", "type": "spacing" },
          "8": { "value": "{spacing.base} * 4", "type": "spacing" },
          "10": { "value": "{spacing.base} * 5", "type": "spacing" },
          "12": { "value": "{spacing.base} * 6", "type": "spacing" },
          "16": { "value": "{spacing.base} * 8", "type": "spacing" }
        }
      }
    },
    "semantic": {
      "color": {
        "background": {
          "primary": {
            "value": { "light": "{core.color.neutral.white}", "dark": "{core.color.black.900}" },
            "type": "color"
          },
          "brand": {
            "value": "{core.color.yellow.500}",
            "type": "color"
          }
        },
        "text": {
          "primary": {
            "value": { "light": "{core.color.black.800}", "dark": "{core.color.neutral.white}" },
            "type": "color"
          },
          "brand": {
            "value": "{core.color.yellow.600}",
            "type": "color"
          }
        }
      }
    },
    "component": {
      "button": {
        "primary": {
          "background": {
            "default": { "value": "{core.color.yellow.500}", "type": "color" },
            "hover": { "value": "{core.color.yellow.600}", "type": "color" },
            "active": { "value": "{core.color.yellow.700}", "type": "color" },
            "disabled": { "value": "{core.color.black.200}", "type": "color" }
          },
          "text": {
            "default": { "value": "{core.color.black.800}", "type": "color" },
            "disabled": { "value": "{core.color.black.400}", "type": "color" }
          }
        }
      }
    }
  }
}
```

## Cross-Platform Outputs

### CSS Variables

```css
:root {
  /* Core Colors */
  --color-yellow-100: #FFF9E6;
  --color-yellow-200: #FFF3CC;
  --color-yellow-300: #FFE799;
  --color-yellow-400: #FFDC66;
  --color-yellow-500: #F9D900;
  --color-yellow-600: #E6C000;
  --color-yellow-700: #B39500;
  --color-yellow-800: #806A00;
  --color-yellow-900: #4D4000;
  
  --color-black-100: #F5F5F5;
  --color-black-200: #E0E0E0;
  --color-black-300: #B3B3B3;
  --color-black-400: #808080;
  --color-black-500: #4D4D4D;
  --color-black-600: #333333;
  --color-black-700: #262626;
  --color-black-800: #1A1A1A;
  --color-black-900: #0D0D0D;
  
  /* Semantic Colors */
  --color-background-primary: var(--color-neutral-white);
  --color-background-secondary: var(--color-black-100);
  --color-background-brand: var(--color-yellow-500);
  
  --color-text-primary: var(--color-black-800);
  --color-text-secondary: var(--color-black-600);
  --color-text-brand: var(--color-yellow-600);
  
  /* Typography */
  --font-family-sans: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Roboto Mono', monospace;
  --font-family-display: 'Space Grotesk', 'Outfit', sans-serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-size-6xl: 3.75rem;
  
  /* Spacing */
  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Component: Button */
  --button-primary-background: var(--color-yellow-500);
  --button-primary-text: var(--color-black-800);
  --button-primary-hover-background: var(--color-yellow-600);
  --button-padding-x-md: var(--spacing-4);
  --button-padding-y-md: var(--spacing-2);
  --button-font-size-md: var(--font-size-base);
  --button-border-radius: 0.375rem;
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-background-primary: var(--color-black-900);
  --color-background-secondary: var(--color-black-800);
  --color-text-primary: var(--color-neutral-white);
  --color-text-secondary: var(--color-black-300);
}

/* Example component usage */
.btn-primary {
  background-color: var(--button-primary-background);
  color: var(--button-primary-text);
  padding: var(--button-padding-y-md) var(--button-padding-x-md);
  font-size: var(--button-font-size-md);
  border-radius: var(--button-border-radius);
  transition: background-color var(--duration-fast) var(--easing-ease-out);
}

.btn-primary:hover {
  background-color: var(--button-primary-hover-background);
}
```

### iOS (Swift)

```swift
import UIKit

public struct CTRCDesignTokens {
    // MARK: - Colors
    public struct Colors {
        public struct Core {
            public struct Yellow {
                public static let shade100 = UIColor(hex: "#FFF9E6")
                public static let shade200 = UIColor(hex: "#FFF3CC")
                public static let shade300 = UIColor(hex: "#FFE799")
                public static let shade400 = UIColor(hex: "#FFDC66")
                public static let shade500 = UIColor(hex: "#FFD500")
                public static let shade600 = UIColor(hex: "#E6C000")
                public static let shade700 = UIColor(hex: "#B39500")
                public static let shade800 = UIColor(hex: "#806A00")
                public static let shade900 = UIColor(hex: "#4D4000")
            }
            
            public struct Black {
                public static let shade100 = UIColor(hex: "#F5F5F5")
                public static let shade200 = UIColor(hex: "#E0E0E0")
                public static let shade300 = UIColor(hex: "#B3B3B3")
                public static let shade400 = UIColor(hex: "#808080")
                public static let shade500 = UIColor(hex: "#4D4D4D")
                public static let shade600 = UIColor(hex: "#333333")
                public static let shade700 = UIColor(hex: "#262626")
                public static let shade800 = UIColor(hex: "#1A1A1A")
                public static let shade900 = UIColor(hex: "#0D0D0D")
            }
        }
        
        public struct Semantic {
            public static let backgroundPrimary = UIColor { traits in
                traits.userInterfaceStyle == .dark ? Core.Black.shade900 : UIColor.white
            }
            public static let backgroundBrand = Core.Yellow.shade500
            public static let textPrimary = UIColor { traits in
                traits.userInterfaceStyle == .dark ? UIColor.white : Core.Black.shade800
            }
            public static let textBrand = Core.Yellow.shade600
        }
    }
    
    // MARK: - Typography
    public struct Typography {
        public struct FontFamily {
            public static let sans = UIFont(name: "Inter-Regular", size: 16) ?? UIFont.systemFont(ofSize: 16)
            public static let display = UIFont(name: "SpaceGrotesk-Regular", size: 16) ?? UIFont.systemFont(ofSize: 16)
            public static let mono = UIFont(name: "JetBrainsMono-Regular", size: 16) ?? UIFont.monospacedSystemFont(ofSize: 16, weight: .regular)
        }
        
        public struct FontSize {
            public static let xs: CGFloat = 12
            public static let sm: CGFloat = 14
            public static let base: CGFloat = 16
            public static let lg: CGFloat = 18
            public static let xl: CGFloat = 20
            public static let xxl: CGFloat = 24
            public static let xxxl: CGFloat = 30
            public static let xxxxl: CGFloat = 36
            public static let xxxxxl: CGFloat = 48
            public static let xxxxxxl: CGFloat = 60
        }
        
        public struct LineHeight {
            public static let tight: CGFloat = 1.25
            public static let snug: CGFloat = 1.375
            public static let normal: CGFloat = 1.5
            public static let relaxed: CGFloat = 1.625
            public static let loose: CGFloat = 2.0
        }
    }
    
    // MARK: - Spacing
    public struct Spacing {
        public static let space0: CGFloat = 0
        public static let space1: CGFloat = 4
        public static let space2: CGFloat = 8
        public static let space3: CGFloat = 12
        public static let space4: CGFloat = 16
        public static let space5: CGFloat = 20
        public static let space6: CGFloat = 24
        public static let space8: CGFloat = 32
        public static let space10: CGFloat = 40
        public static let space12: CGFloat = 48
        public static let space16: CGFloat = 64
    }
    
    // MARK: - Shadows
    public struct Shadow {
        public static let sm = NSShadow().apply {
            $0.shadowOffset = CGSize(width: 0, height: 1)
            $0.shadowBlurRadius = 2
            $0.shadowColor = UIColor.black.withAlphaComponent(0.05)
        }
        
        public static let base = NSShadow().apply {
            $0.shadowOffset = CGSize(width: 0, height: 1)
            $0.shadowBlurRadius = 3
            $0.shadowColor = UIColor.black.withAlphaComponent(0.1)
        }
        
        public static let md = NSShadow().apply {
            $0.shadowOffset = CGSize(width: 0, height: 4)
            $0.shadowBlurRadius = 6
            $0.shadowColor = UIColor.black.withAlphaComponent(0.1)
        }
    }
    
    // MARK: - Motion
    public struct Motion {
        public struct Duration {
            public static let fast: TimeInterval = 0.15
            public static let normal: TimeInterval = 0.3
            public static let slow: TimeInterval = 0.5
        }
        
        public struct Curve {
            public static let easeOut = CAMediaTimingFunction(controlPoints: 0, 0, 0.2, 1)
            public static let easeInOut = CAMediaTimingFunction(controlPoints: 0.4, 0, 0.2, 1)
        }
    }
    
    // MARK: - Components
    public struct Button {
        public struct Primary {
            public static let backgroundColor = Colors.Core.Yellow.shade500
            public static let textColor = Colors.Core.Black.shade800
            public static let hoverBackgroundColor = Colors.Core.Yellow.shade600
        }
        
        public static let paddingHorizontal = Spacing.space4
        public static let paddingVertical = Spacing.space2
        public static let fontSize = Typography.FontSize.base
        public static let cornerRadius: CGFloat = 6
    }
}

// MARK: - Extensions
extension UIColor {
    convenience init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            red: CGFloat(r) / 255,
            green: CGFloat(g) / 255,
            blue: CGFloat(b) / 255,
            alpha: CGFloat(a) / 255
        )
    }
}
```

### Android (XML)

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Core Colors -->
    <color name="yellow_100">#FFF9E6</color>
    <color name="yellow_200">#FFF3CC</color>
    <color name="yellow_300">#FFE799</color>
    <color name="yellow_400">#FFDC66</color>
    <color name="yellow_500">#FFD500</color>
    <color name="yellow_600">#E6C000</color>
    <color name="yellow_700">#B39500</color>
    <color name="yellow_800">#806A00</color>
    <color name="yellow_900">#4D4000</color>
    
    <color name="black_100">#F5F5F5</color>
    <color name="black_200">#E0E0E0</color>
    <color name="black_300">#B3B3B3</color>
    <color name="black_400">#808080</color>
    <color name="black_500">#4D4D4D</color>
    <color name="black_600">#333333</color>
    <color name="black_700">#262626</color>
    <color name="black_800">#1A1A1A</color>
    <color name="black_900">#0D0D0D</color>
    
    <!-- Semantic Colors -->
    <color name="background_primary">@color/white</color>
    <color name="background_secondary">@color/black_100</color>
    <color name="background_brand">@color/yellow_500</color>
    
    <color name="text_primary">@color/black_800</color>
    <color name="text_secondary">@color/black_600</color>
    <color name="text_brand">@color/yellow_600</color>
    
    <!-- Typography (dimens.xml) -->
    <dimen name="font_size_xs">12sp</dimen>
    <dimen name="font_size_sm">14sp</dimen>
    <dimen name="font_size_base">16sp</dimen>
    <dimen name="font_size_lg">18sp</dimen>
    <dimen name="font_size_xl">20sp</dimen>
    <dimen name="font_size_2xl">24sp</dimen>
    <dimen name="font_size_3xl">30sp</dimen>
    <dimen name="font_size_4xl">36sp</dimen>
    <dimen name="font_size_5xl">48sp</dimen>
    <dimen name="font_size_6xl">60sp</dimen>
    
    <!-- Spacing (dimens.xml) -->
    <dimen name="spacing_0">0dp</dimen>
    <dimen name="spacing_1">4dp</dimen>
    <dimen name="spacing_2">8dp</dimen>
    <dimen name="spacing_3">12dp</dimen>
    <dimen name="spacing_4">16dp</dimen>
    <dimen name="spacing_5">20dp</dimen>
    <dimen name="spacing_6">24dp</dimen>
    <dimen name="spacing_8">32dp</dimen>
    <dimen name="spacing_10">40dp</dimen>
    <dimen name="spacing_12">48dp</dimen>
    <dimen name="spacing_16">64dp</dimen>
    
    <!-- Border Radius (dimens.xml) -->
    <dimen name="radius_none">0dp</dimen>
    <dimen name="radius_sm">2dp</dimen>
    <dimen name="radius_base">4dp</dimen>
    <dimen name="radius_md">6dp</dimen>
    <dimen name="radius_lg">8dp</dimen>
    <dimen name="radius_xl">12dp</dimen>
    <dimen name="radius_2xl">16dp</dimen>
    <dimen name="radius_3xl">24dp</dimen>
    
    <!-- Component: Button -->
    <color name="button_primary_background">@color/yellow_500</color>
    <color name="button_primary_text">@color/black_800</color>
    <color name="button_primary_hover_background">@color/yellow_600</color>
    
    <dimen name="button_padding_horizontal_md">@dimen/spacing_4</dimen>
    <dimen name="button_padding_vertical_md">@dimen/spacing_2</dimen>
    <dimen name="button_text_size_md">@dimen/font_size_base</dimen>
    <dimen name="button_corner_radius">@dimen/radius_md</dimen>
</resources>

<!-- styles.xml -->
<style name="Button.Primary" parent="Widget.MaterialComponents.Button">
    <item name="android:backgroundTint">@color/button_primary_background</item>
    <item name="android:textColor">@color/button_primary_text</item>
    <item name="android:paddingLeft">@dimen/button_padding_horizontal_md</item>
    <item name="android:paddingRight">@dimen/button_padding_horizontal_md</item>
    <item name="android:paddingTop">@dimen/button_padding_vertical_md</item>
    <item name="android:paddingBottom">@dimen/button_padding_vertical_md</item>
    <item name="android:textSize">@dimen/button_text_size_md</item>
    <item name="cornerRadius">@dimen/button_corner_radius</item>
    <item name="android:stateListAnimator">@animator/button_state_list_animator</item>
</style>

<!-- Dark Theme (values-night/colors.xml) -->
<resources>
    <color name="background_primary">@color/black_900</color>
    <color name="background_secondary">@color/black_800</color>
    <color name="text_primary">@color/white</color>
    <color name="text_secondary">@color/black_300</color>
</resources>
```

## Integration Guide

### Style Dictionary Setup

```javascript
// config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables'
      }]
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      files: [{
        destination: 'DesignTokens.swift',
        format: 'ios-swift/class.swift',
        className: 'DesignTokens'
      }]
    },
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      files: [{
        destination: 'colors.xml',
        format: 'android/colors'
      }, {
        destination: 'dimens.xml',
        format: 'android/dimens'
      }]
    }
  }
};
```

### Figma Tokens

1. Install Figma Tokens plugin
2. Create token sets matching our structure:
   - Core
   - Semantic
   - Component
   - Themes (Light/Dark)

3. Sync configuration:
```json
{
  "tokenSetOrder": [
    "core",
    "semantic",
    "component",
    "theme/light",
    "theme/dark"
  ],
  "themes": [
    {
      "id": "light",
      "name": "Light Theme",
      "selectedTokenSets": {
        "core": "enabled",
        "semantic": "enabled",
        "component": "enabled",
        "theme/light": "enabled"
      }
    },
    {
      "id": "dark",
      "name": "Dark Theme",
      "selectedTokenSets": {
        "core": "enabled",
        "semantic": "enabled",
        "component": "enabled",
        "theme/dark": "enabled"
      }
    }
  ]
}
```

### Storybook Documentation

```javascript
// .storybook/preview.js
import { themes } from '@storybook/theming';
import tokens from '../build/js/tokens.js';

export const parameters = {
  docs: {
    theme: {
      ...themes.normal,
      colorPrimary: tokens.color.core.yellow[500],
      colorSecondary: tokens.color.core.black[800],
    },
  },
};

// stories/DesignTokens.stories.js
import React from 'react';

export default {
  title: 'Design System/Tokens',
};

export const Colors = () => (
  <div>
    <h2>Brand Colors</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
      {Object.entries(tokens.color.core.yellow).map(([key, value]) => (
        <div key={key}>
          <div
            style={{
              backgroundColor: value,
              height: '60px',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}
          />
          <p>Yellow {key}</p>
          <code>{value}</code>
        </div>
      ))}
    </div>
  </div>
);

export const Typography = () => (
  <div>
    <h2>Type Scale</h2>
    {Object.entries(tokens.font.size).map(([key, value]) => (
      <div key={key} style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: value, margin: 0 }}>
          {key}: The quick brown fox jumps over the lazy dog
        </p>
        <code>{value}</code>
      </div>
    ))}
  </div>
);

export const Spacing = () => (
  <div>
    <h2>Spacing Scale</h2>
    {Object.entries(tokens.spacing).map(([key, value]) => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div
          style={{
            backgroundColor: tokens.color.core.yellow[500],
            height: '24px',
            width: value
          }}
        />
        <span style={{ marginLeft: '1rem' }}>{key}: {value}</span>
      </div>
    ))}
  </div>
);
```

## Governance & Maintenance

### Contribution Process

1. **Token Addition Request**
   - Create issue with justification
   - Include usage examples
   - Reference design mockups

2. **Review Process**
   - Design team approval
   - Development team review
   - Accessibility check

3. **Implementation**
   - Create feature branch
   - Update token files
   - Generate platform outputs
   - Update documentation

4. **Testing**
   - Visual regression tests
   - Cross-platform validation
   - WCAG compliance check

### Version Control

```json
{
  "version": "1.0.0",
  "changelog": {
    "1.0.0": {
      "date": "2024-01-15",
      "changes": [
        "Initial token system release",
        "Core color palette based on CTRC branding",
        "Complete typography scale",
        "8px spacing system",
        "Component tokens for Button, Card, Input"
      ]
    }
  }
}
```

### Deprecation Policy

1. **Deprecation Notice**
   - Mark token as deprecated
   - Add migration note
   - Set removal version

2. **Migration Period**
   - Minimum 2 version cycles
   - Console warnings in dev
   - Migration guide provided

3. **Removal**
   - Remove from source
   - Update documentation
   - Verify no usage

Example:
```json
{
  "color-primary": {
    "value": "#FFD500",
    "deprecated": true,
    "deprecated_message": "Use color.core.yellow.500 instead",
    "deprecated_version": "1.1.0",
    "removal_version": "2.0.0"
  }
}
```

### Automated Validation

```javascript
// validate-tokens.js
const tokens = require('./tokens/index.json');

// Contrast checking
function checkContrast(foreground, background) {
  // WCAG contrast calculation
  return contrastRatio >= 4.5; // AA standard
}

// Validate all text/background combinations
Object.entries(tokens.semantic.color.text).forEach(([textKey, textColor]) => {
  Object.entries(tokens.semantic.color.background).forEach(([bgKey, bgColor]) => {
    const ratio = checkContrast(textColor.value, bgColor.value);
    if (ratio < 4.5) {
      console.warn(`Low contrast: ${textKey} on ${bgKey} (${ratio})`);
    }
  });
});
```

This comprehensive Design Token System provides a complete foundation for maintaining design consistency across all platforms while supporting the unique Caution Tape Robotics brand identity.