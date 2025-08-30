# Navbar Theme Configuration

The navbar theme system allows you to configure the landing page navbar with a reversed color theme, where the navbar can use a dark theme while the main page uses a light theme (or vice versa).

## Features

- **Reverse Theme**: Automatically reverse the navbar theme compared to the main application theme
- **Custom Colors**: Apply custom colors specifically to the navbar
- **Environment Variables**: Configure through `.env` files
- **Real-time Updates**: Theme changes apply immediately without page refresh

## Configuration

### Environment Variables

Add these variables to your `.env.development` or `.env.local` file:

```env
# Enable reversed navbar theme (dark navbar when app is light, light navbar when app is dark)
VITE_NAVBAR_REVERSE_THEME=true

# Enable custom theme overrides (required for custom navbar colors)
VITE_ENABLE_CUSTOM_THEME=true

# Custom navbar colors (optional, only used if VITE_ENABLE_CUSTOM_THEME=true)
VITE_NAVBAR_BACKGROUND_COLOR=0.129 0.042 264.695
VITE_NAVBAR_FOREGROUND_COLOR=0.984 0.003 247.858
VITE_NAVBAR_PRIMARY_COLOR=0.929 0.013 255.508
```

### Color Format

Colors should be in OKLCH format: `"lightness chroma hue"`

Examples:
- Light background: `1 0 0`
- Dark background: `0.129 0.042 264.695`
- Blue primary: `0.551 0.211 242.623`

## Usage Examples

### Example 1: Simple Reverse Theme

```env
VITE_NAVBAR_REVERSE_THEME=true
```

This will make the navbar use the opposite theme:
- When app is in light mode → navbar uses dark colors
- When app is in dark mode → navbar uses light colors

### Example 2: Custom Navbar Colors

```env
VITE_NAVBAR_REVERSE_THEME=false
VITE_ENABLE_CUSTOM_THEME=true
VITE_NAVBAR_BACKGROUND_COLOR=0.2 0.05 260
VITE_NAVBAR_FOREGROUND_COLOR=0.95 0.01 260
```

This applies custom colors to the navbar regardless of the main theme.

### Example 3: Reverse Theme with Custom Accent

```env
VITE_NAVBAR_REVERSE_THEME=true
VITE_ENABLE_CUSTOM_THEME=true
VITE_NAVBAR_PRIMARY_COLOR=0.65 0.18 300
```

This reverses the theme and applies a custom primary color to the navbar.

## Technical Implementation

### Components Affected

- `PublicNavbar`: The main landing page navbar component
- `useNavbarTheme`: Custom hook that manages navbar theming

### CSS Variables

The system creates navbar-specific CSS variables:

```css
--navbar-background
--navbar-foreground
--navbar-muted
--navbar-muted-foreground
--navbar-accent
--navbar-accent-foreground
--navbar-primary
--navbar-primary-foreground
--navbar-border
```

### Theme Classes

When reverse theme is enabled, the navbar gets these classes:
- `navbar-reverse-theme`: Base class for reversed theming
- `light` or `dark`: Current navbar theme mode

## Advanced Usage

### Programmatic Configuration

You can also configure navbar theming programmatically by modifying the theme configuration:

```typescript
import { useTheme } from '@/context/theme-context'

const { themeConfig } = useTheme()

// Check if navbar is using reverse theme
const isReversed = themeConfig.navbar?.reverseTheme

// Get navbar-specific colors
const navbarColors = themeConfig.navbar?.customColors
```

### Custom Hook Usage

```typescript
import { useNavbarTheme } from '@/hooks/use-navbar-theme'

function MyNavbarComponent() {
  const { navbarMode, isReversed, navbarClasses } = useNavbarTheme()
  
  return (
    <nav className={navbarClasses}>
      {/* Your navbar content */}
    </nav>
  )
}
```

## Troubleshooting

### Common Issues

1. **Colors not applying**: Make sure `VITE_ENABLE_CUSTOM_THEME=true` is set
2. **Reverse theme not working**: Check that `VITE_NAVBAR_REVERSE_THEME=true` is set
3. **Colors look wrong**: Verify OKLCH format is correct (lightness chroma hue)

### Debug Tips

- Check browser developer tools for CSS variables starting with `--navbar-`
- Verify environment variables are loaded correctly
- Test with different theme presets to ensure compatibility

## Browser Support

The navbar theming system works in all modern browsers that support:
- CSS custom properties (CSS variables)
- OKLCH color space (with automatic fallbacks)

For older browsers, the system gracefully degrades to use standard theme colors.