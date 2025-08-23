# KQS POS Brand Colors

## Primary Brand Color
- **Hex**: `#E5FF29`
- **Description**: Bright yellow/green (lime green)
- **Usage**: Primary brand color for icons, buttons, highlights, and accents

## Color Usage Guidelines

### Icons
- **Background**: `bg-[#E5FF29]` (brand color background)
- **Icon Color**: `text-black` (black icons for contrast)
- **Size**: `w-6 h-6` for section icons, `w-8 h-8` for page header icons

### Toggles & Buttons
- **Active State**: `bg-[#E5FF29]` (brand color)
- **Focus Ring**: `focus:ring-[#E5FF29]` (brand color)
- **Hover Effects**: `hover:bg-[#E5FF29]/90` (brand color with opacity)

### Text & Typography
- **Primary Text**: `text-gray-900` (dark gray)
- **Secondary Text**: `text-gray-600` (medium gray)
- **Muted Text**: `text-gray-500` (light gray)

### Backgrounds
- **Card Backgrounds**: `bg-white`
- **Page Background**: `bg-[hsl(var(--background))]`
- **Borders**: `border-gray-100` (subtle borders)

## Implementation Examples

### Icon with Brand Background
```tsx
<div className="w-6 h-6 rounded-lg bg-[#E5FF29] flex items-center justify-center">
  <Icon className="h-4 w-4 text-black" />
</div>
```

### Toggle with Brand Color
```tsx
<button className={cn(
  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
  checked ? "bg-[#E5FF29]" : "bg-gray-200"
)}>
```

### Button with Brand Gradient
```tsx
<PremiumButton gradient="green" className="rounded-full">
  Save Changes
</PremiumButton>
```

## Notes
- Always use black text/icons on the brand color background for maximum contrast
- The brand color `#E5FF29` should be used consistently across all UI components
- This color represents the KQS POS brand identity and should not be changed without approval 