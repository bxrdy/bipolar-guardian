# Accessibility Implementation Guide

**[Documentation Hub](../README.md) > [Developer Documentation](README.md) > Accessibility**

**For UI/UX Designers, Frontend Engineers, and Product Teams**

## Design System Accessibility

### Color System & Contrast
Our shadcn/ui + Tailwind design system provides accessible color foundations:

```typescript
// tailwind.config.ts color system
primary: "hsl(var(--primary))",           // 4.5:1 contrast minimum
secondary: "hsl(var(--secondary))",       // 3:1 for large text
destructive: "hsl(var(--destructive))",   // Error states
muted: "hsl(var(--muted))",              // Secondary content
```

**Risk Level Color Coding** (`src/components/RiskLevelBadge.tsx`):
- **Green (Low)**: HSL(142, 71%, 45%) - 4.6:1 contrast ratio
- **Amber (Medium)**: HSL(48, 96%, 53%) - 7.2:1 contrast ratio  
- **Red (High)**: HSL(0, 84%, 60%) - 4.8:1 contrast ratio

**Dark Mode Support**:
All components automatically inherit dark mode via `class="dark"` on document root.

### Typography Scale
```css
/* Accessible typography hierarchy */
.text-xs    /* 12px - minimum for touch targets */
.text-sm    /* 14px - secondary content */
.text-base  /* 16px - body text default */
.text-lg    /* 18px - large text (3:1 contrast) */
.text-xl    /* 20px - headings */
.text-2xl   /* 24px - page titles */
```

**Implementation in Components**:
- Body text: `className="text-base"` (16px minimum)
- Labels: `className="text-sm font-medium"` (14px with medium weight)
- Headings: `className="text-xl font-semibold"` (20px with semantic hierarchy)

### Touch Targets & Spacing
**Minimum Touch Target**: 44px × 44px for all interactive elements

**Button Component** (`src/components/ui/button.tsx`):
```typescript
// Size variants with accessible dimensions
size: {
  sm: "h-9 px-3",      // 36px height - use sparingly
  default: "h-11 px-4", // 44px height - standard
  lg: "h-12 px-8",     // 48px height - primary actions
  icon: "h-11 w-11",   // 44px square for icon buttons
}
```

**Spacing System** (8px grid):
```css
.space-y-1  /* 4px - tight content */
.space-y-2  /* 8px - related elements */
.space-y-4  /* 16px - section separation */
.space-y-6  /* 24px - component separation */
```

## Component Accessibility Patterns

### Form Accessibility
**React Hook Form + Zod Implementation**:

```typescript
// Example from medication forms
<FormField
  control={form.control}
  name="medicationName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Medication Name</FormLabel>
      <FormControl>
        <Input 
          {...field} 
          aria-describedby="medication-error"
          aria-invalid={!!fieldState.error}
        />
      </FormControl>
      <FormDescription>
        Enter the exact name as prescribed
      </FormDescription>
      <FormMessage id="medication-error" />
    </FormItem>
  )}
/>
```

**Key Patterns**:
- Automatic `aria-describedby` linking error messages
- `aria-invalid` state management via React Hook Form
- Semantic `<FormLabel>` association with inputs
- Clear error messaging with specific IDs

### Modal & Overlay Focus Management
**Radix UI Implementation** (`src/components/ui/dialog.tsx`):

```typescript
// Automatic focus trapping and restoration
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle> {/* Automatic focus */}
      <DialogDescription>
        Manage your health data preferences
      </DialogDescription>
    </DialogHeader>
    {/* Content automatically trapped */}
  </DialogContent>
</Dialog>
```

**Focus Management Features**:
- Automatic focus trapping within modal
- Focus restoration to trigger element on close
- Escape key handling built-in
- Overlay click to close (configurable)

### Data Visualization Accessibility
**Chart Components** (`src/components/ui/chart.tsx`):

```typescript
// Accessible chart implementation
<ChartContainer
  config={chartConfig}
  className="min-h-[200px]"
>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={moodData}>
      <XAxis 
        dataKey="date"
        tick={{ fontSize: 12 }}
        aria-label="Date axis"
      />
      <YAxis 
        domain={[1, 10]}
        aria-label="Mood level from 1 to 10"
      />
      <Tooltip 
        content={({ active, payload, label }) => (
          <div role="tooltip" aria-live="polite">
            {/* Custom accessible tooltip */}
          </div>
        )}
      />
      <Line 
        dataKey="mood"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        aria-label="Mood trend line"
      />
    </LineChart>
  </ResponsiveContainer>
</ChartContainer>
```

**Accessibility Features**:
- `aria-label` for chart elements
- `role="tooltip"` with `aria-live="polite"`
- High contrast stroke colors
- Keyboard navigation support
- Alternative data table representation available

### Loading States & Error Boundaries
**Loading Skeleton** (`src/components/ui/loading-skeleton.tsx`):

```typescript
<Skeleton 
  className="h-4 w-[250px]"
  aria-label="Loading content"
  role="status"
/>
```

**Error Boundary** (`src/components/ErrorBoundary.tsx`):
```typescript
<div role="alert" aria-live="assertive">
  <h2>Something went wrong</h2>
  <p>We're sorry, but something unexpected happened.</p>
  <Button onClick={retry}>Try Again</Button>
</div>
```

## Mobile Accessibility (Capacitor)

### iOS Accessibility
**VoiceOver Support**:
```typescript
// iOS-specific accessibility traits
<div 
  role="button"
  aria-label="Add mood entry"
  data-ios-accessibilityTraits="button"
/>
```

**Safe Area Handling**:
```css
/* Respect iOS safe areas */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Android Accessibility
**TalkBack Support**:
```typescript
// Semantic content descriptions
<Button 
  aria-label="Submit mood entry for today"
  aria-describedby="mood-instructions"
>
  Submit
</Button>
```

**Haptic Feedback**:
```typescript
// Accessible haptic feedback for important actions
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const submitWithFeedback = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  // Submit action
};
```

## Testing Procedures

### Automated Testing
**axe-core Integration** (planned):
```typescript
// Jest test setup
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Dashboard should be accessible', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Protocol

**1. Keyboard Navigation Test**
- Tab through entire interface
- Verify focus indicators are visible (2px ring)
- Test skip links functionality
- Ensure all interactive elements are reachable

**2. Screen Reader Testing**
- **macOS**: VoiceOver (Cmd + F5)
- **Windows**: NVDA (free) or JAWS
- **Mobile**: VoiceOver (iOS) / TalkBack (Android)

**Test Scenarios**:
- Navigate mood entry form
- Use AI Guardian chat interface
- Browse health data visualizations
- Interact with settings panels

**3. Visual Testing**
- Zoom to 200% (browser zoom)
- Test high contrast mode
- Verify dark mode accessibility
- Check touch target sizes on mobile

### Browser Testing Matrix
**Desktop**:
- Chrome (latest, latest-1)
- Firefox (latest, latest-1)  
- Safari (latest, latest-1)
- Edge (latest)

**Mobile**:
- Safari iOS (latest, latest-1)
- Chrome Android (latest, latest-1)
- Samsung Internet (latest)

### Performance Accessibility
**Reduced Motion Support**:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-in {
    animation: none;
  }
  
  .transition-all {
    transition: none;
  }
}
```

**Implementation in Framer Motion**:
```typescript
const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.3,
    ease: "easeOut"
  },
  // Respect user preference
  ...(!prefersReducedMotion && { initial: { opacity: 0 } })
};
```

## Success Metrics

### Accessibility Targets
- **Lighthouse Accessibility Score**: 95+ (targeting 100)
- **axe-core Violations**: 0
- **Color Contrast**: WCAG AA compliant (4.5:1 normal, 3:1 large)
- **Keyboard Navigation**: 100% functionality without mouse

### Performance Targets
- **Largest Contentful Paint**: < 2.5 seconds
- **First Input Delay**: < 100 milliseconds
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 200 milliseconds

### User Experience Metrics
- **Task Completion Rate**: >90% for critical user journeys
- **Error Rate**: <5% for form submissions
- **Touch Target Success**: 100% minimum 44px compliance
- **Focus Management**: 100% success rate for modal interactions

## Implementation Checklist

### Design Phase
- [ ] Color contrast verification (4.5:1 minimum)
- [ ] Touch target sizing (44px minimum)
- [ ] Typography hierarchy with semantic meaning
- [ ] Focus indicator design (2px minimum)
- [ ] Error state design with clear messaging

### Development Phase
- [ ] Semantic HTML structure
- [ ] ARIA labels for complex components
- [ ] Form label associations
- [ ] Keyboard navigation implementation
- [ ] Screen reader testing

### QA Phase
- [ ] Automated accessibility testing
- [ ] Cross-browser compatibility
- [ ] Mobile accessibility validation
- [ ] Performance impact assessment
- [ ] User acceptance testing with assistive technologies

## Resources & Tools

### Testing Tools
- **Chrome DevTools**: Accessibility panel and Lighthouse
- **Firefox DevTools**: Accessibility inspector
- **axe DevTools**: Browser extension for detailed analysis
- **Colour Contrast Analyser**: Desktop app for contrast testing

### Screen Readers
- **macOS**: VoiceOver (built-in)
- **Windows**: NVDA (free) - https://www.nvaccess.org/
- **iOS**: VoiceOver (Settings > Accessibility)
- **Android**: TalkBack (Settings > Accessibility)

### Documentation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Radix UI Accessibility**: https://www.radix-ui.com/primitives
- **shadcn/ui Components**: https://ui.shadcn.com/

---

**Remember**: Accessibility is not a checklist—it's about creating inclusive experiences for all users. Test with real users who rely on assistive technologies whenever possible.