# Caution Tape Robotics Design Token System

A comprehensive design token system for multi-platform (Web, iOS, Android) development at Caution Tape Robotics, focusing on STEM education in robotics and AI.

## 🎨 Brand Identity

- **Primary Color**: Yellow (#F9D900)
- **Secondary Color**: Black (#1A1A1A)
- **Display Font**: Space Grotesk
- **Body Font**: Inter
- **Code Font**: JetBrains Mono

## 📁 Project Structure

```
design-system-token/
├── tokens/                    # Source design tokens
│   ├── core/                 # Raw value tokens
│   │   ├── colors.json
│   │   ├── typography.json
│   │   ├── spacing.json
│   │   ├── borders.json
│   │   ├── shadows.json
│   │   ├── motion.json
│   │   └── breakpoints.json
│   ├── semantic/             # Context-based tokens
│   │   ├── colors.json
│   │   └── typography.json
│   ├── components/           # Component-specific tokens
│   │   ├── button.json
│   │   ├── card.json
│   │   └── input.json
│   └── themes/              # Theme variations
│       ├── light.json
│       └── dark.json
├── build/                    # Generated platform files
├── index.html               # Interactive demo
├── font-showcase.html       # Font testing page
└── style-dictionary.config.js

```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build tokens for all platforms
npm run build

# Watch for changes
npm run watch
```

### View Documentation

1. Open `index.html` in a browser to see the interactive design token showcase
2. Open `font-showcase.html` to explore typography options
3. Read `DESIGN-TOKEN-SYSTEM.md` for comprehensive documentation

## 🛠️ Usage

### Web (CSS Variables)

```css
.button-primary {
  background-color: var(--color-yellow-500);
  color: var(--color-black-800);
  font-family: var(--font-family-sans);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
}
```

### iOS (Swift)

```swift
let button = UIButton()
button.backgroundColor = CTRCDesignTokens.Colors.Core.Yellow.shade500
button.setTitleColor(CTRCDesignTokens.Colors.Core.Black.shade800, for: .normal)
button.titleLabel?.font = CTRCDesignTokens.Typography.FontFamily.sans
```

### Android (XML)

```xml
<Button
    android:background="@color/yellow_500"
    android:textColor="@color/black_800"
    android:fontFamily="@font/inter"
    android:padding="@dimen/spacing_4" />
```

## 📋 Token Categories

### Core Tokens
- **Colors**: 9-shade scales for yellow and black/gray
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: 8px-based scale from 0 to 256px
- **Borders**: Width and radius options
- **Shadows**: 5 elevation levels
- **Motion**: Animation durations and easings
- **Breakpoints**: Responsive design values

### Semantic Tokens
- **Background Colors**: primary, secondary, brand, inverse
- **Text Colors**: primary, secondary, disabled, brand
- **Border Colors**: default, subtle, strong, states
- **Typography Styles**: headings, body, labels, captions

### Component Tokens
- **Buttons**: Primary, secondary, danger variants
- **Cards**: Padding, borders, shadows
- **Inputs**: States, focus styles, validation

## 🎯 Design Principles

1. **Technical Authority**: Convey expertise in robotics and AI
2. **Approachability**: Remain friendly for students
3. **Accessibility**: WCAG AA compliance
4. **Performance**: Optimized for fast loading
5. **Consistency**: Single source of truth across platforms

## 🔄 Build Process

The build process uses [Style Dictionary](https://amzn.github.io/style-dictionary/) to transform JSON tokens into platform-specific formats:

```bash
# Output locations
build/
├── css/          # CSS variables
├── scss/         # SCSS variables
├── ios/          # Swift files
├── android/      # Android XML resources
├── js/           # JavaScript modules
└── json/         # Flattened JSON
```

## 🤝 Contributing

1. Create a feature branch
2. Update tokens in `tokens/` directory
3. Run `npm run build` to verify output
4. Test in the HTML preview pages
5. Submit PR with screenshots

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Resources

- [Design Token System Documentation](./DESIGN-TOKEN-SYSTEM.md)
- [Font Recommendations](./FONT-RECOMMENDATIONS.md)
- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [Figma Tokens Plugin](https://www.figma.com/community/plugin/843461159747178978)