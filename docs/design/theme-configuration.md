# Theme Configuration Guide

This guide explains how to configure and customize themes in the shadcn boilerplate using environment variables.

## Overview

The theme system supports:
- 5 predefined color themes
- Light/dark mode switching
- Environment-based configuration
- Custom color overrides
- OKLCH color space for better perceptual uniformity

## Environment Variables

Add these variables to your `.env` file:

```env
# Theme Configuration
VITE_THEME_PRESET=default        # Options: default, emerald, crimson, ocean, sunset
VITE_DEFAULT_MODE=system          # Options: light, dark, system
VITE_ENABLE_CUSTOM_THEME=false    # Enable custom color overrides
```

## Available Theme Presets

### 1. Default (Purple/Blue)
The original shadcn theme with purple and blue tones.
```env
VITE_THEME_PRESET=default
```

### 2. Emerald (Green)
A fresh green theme inspired by nature.
```env
VITE_THEME_PRESET=emerald
```

### 3. Crimson (Red)
A bold red theme for attention-grabbing interfaces.
```env
VITE_THEME_PRESET=crimson
```

### 4. Ocean (Blue)
A calm blue theme reminiscent of the sea.
```env
VITE_THEME_PRESET=ocean
```

### 5. Sunset (Orange/Warm)
A warm theme with orange and yellow tones.
```env
VITE_THEME_PRESET=sunset
```

## Custom Color Overrides

To customize specific colors while keeping the rest of the theme:

1. Enable custom theme mode:
```env
VITE_ENABLE_CUSTOM_THEME=true
```

2. Add custom colors in OKLCH format:
```env
VITE_PRIMARY_COLOR=0.6 0.16 163      # Format: lightness chroma hue
VITE_SECONDARY_COLOR=0.8 0.1 200
VITE_ACCENT_COLOR=0.7 0.15 250
```

## OKLCH Color Format

OKLCH uses three values:
- **Lightness** (0-1): 0 = black, 1 = white
- **Chroma** (0-0.4): 0 = gray, higher = more colorful
- **Hue** (0-360): Color wheel position

Example conversions:
- Red: `0.6 0.24 30`
- Green: `0.6 0.16 163`
- Blue: `0.6 0.12 230`
- Purple: `0.6 0.15 280`

## Theme Colors Reference

Each theme includes these semantic colors:
- `primary` / `primary-foreground` - Main brand color
- `secondary` / `secondary-foreground` - Secondary actions
- `accent` / `accent-foreground` - Highlights
- `destructive` / `destructive-foreground` - Errors/warnings
- `muted` / `muted-foreground` - Subtle backgrounds
- `card` / `card-foreground` - Card components
- `popover` / `popover-foreground` - Dropdowns/tooltips
- `background` / `foreground` - Main app background
- `border` - Border colors
- `input` - Form inputs
- `ring` - Focus states
- `chart-1` through `chart-5` - Data visualization

## Usage Examples

### Development with Different Themes

Test different themes during development:
```bash
# Test emerald theme
VITE_THEME_PRESET=emerald npm run dev

# Test dark mode by default
VITE_DEFAULT_MODE=dark npm run dev
```

### Production Deployment

Set theme in your deployment environment:
```env
VITE_THEME_PRESET=ocean
VITE_DEFAULT_MODE=light
```

### Custom Brand Colors

For a custom brand theme:
```env
VITE_THEME_PRESET=default
VITE_ENABLE_CUSTOM_THEME=true
VITE_PRIMARY_COLOR=0.5 0.25 280    # Custom purple
VITE_SECONDARY_COLOR=0.7 0.15 200  # Custom blue
```

## Theme Switching

Users can still switch between light/dark modes using the theme toggle in the UI. The environment variables only set:
- The color palette (preset)
- The initial/default mode

## Adding New Theme Presets

To add a new theme preset:

1. Create a new file in `src/lib/themes/presets/`
2. Export a `ThemePreset` object with light and dark variants
3. Add the theme to the registry in `src/lib/themes/index.ts`
4. Update the TypeScript types in `src/vite-env.d.ts`

## Troubleshooting

- **Theme not applying**: Ensure you've restarted the dev server after changing `.env`
- **Colors look wrong**: Verify OKLCH values are in correct format
- **TypeScript errors**: Update `vite-env.d.ts` with new theme names
- **Custom colors not working**: Check `VITE_ENABLE_CUSTOM_THEME=true`