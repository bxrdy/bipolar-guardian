# Frontend Testing & QA Guide

**[Documentation Hub](../README.md) > [Developer Documentation](README.md) > Testing**

**For QA Engineers, Frontend Developers, and Product Teams**

## Testing Strategy Overview

Bipolar Guardian requires comprehensive testing across multiple dimensions: component functionality, health data accuracy, accessibility compliance, and cross-platform compatibility.

### Test Pyramid Structure
```
                    E2E Tests
                   /           \
              Integration Tests
             /                   \
        Component Tests           Unit Tests
       /                                   \
  Manual QA Testing                API Testing
```

## Component Library Testing

### shadcn/ui Component Validation
**Button Component Testing** (`src/components/ui/button.tsx`):

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders with correct variant styles', () => {
    render(<Button variant="default">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  test('handles loading state correctly', () => {
    render(<Button loading>Processing</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('meets accessibility requirements', () => {
    render(<Button>Action</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    // Minimum touch target size
    expect(button).toHaveStyle('min-height: 44px');
  });
});
```

### Form Component Testing
**React Hook Form + Zod Integration**:

```typescript
// Medication form testing
import { MedicationForm } from '@/components/medications/MedicationForm';

describe('MedicationForm', () => {
  test('validates required medication name', async () => {
    render(<MedicationForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /add medication/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Medication name is required')).toBeInTheDocument();
    });
  });

  test('handles dosage validation correctly', async () => {
    render(<MedicationForm onSubmit={mockSubmit} />);
    
    const dosageInput = screen.getByLabelText(/dosage/i);
    fireEvent.change(dosageInput, { target: { value: '-5' } });
    
    await waitFor(() => {
      expect(screen.getByText('Dosage must be positive')).toBeInTheDocument();
    });
  });
});
```

### Data Visualization Testing
**Chart Component Validation**:

```typescript
// Mood trend chart testing
import { SevenDayTrendChart } from '@/components/SevenDayTrendChart';

describe('SevenDayTrendChart', () => {
  const mockMoodData = [
    { date: '2025-01-01', mood: 7, energy: 6 },
    { date: '2025-01-02', mood: 5, energy: 4 },
    // ... more test data
  ];

  test('renders chart with correct data points', () => {
    render(<SevenDayTrendChart data={mockMoodData} />);
    
    // Check if chart container exists
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    
    // Verify data points are rendered
    const dataPoints = screen.getAllByRole('graphics-symbol');
    expect(dataPoints).toHaveLength(mockMoodData.length);
  });

  test('provides accessible chart description', () => {
    render(<SevenDayTrendChart data={mockMoodData} />);
    
    expect(screen.getByLabelText(/mood trend over 7 days/i)).toBeInTheDocument();
  });
});
```

## Health Data Testing

### Personal Baseline Testing
**Baseline Calculation Validation**:

```typescript
// Test baseline calculation logic
import { useBaselines } from '@/hooks/useBaselines';

describe('Personal Baselines', () => {
  test('calculates initial baseline after 7 days', async () => {
    const mockData = generateMoodData(7); // Helper function
    const { result } = renderHook(() => useBaselines(mockData));
    
    await waitFor(() => {
      expect(result.current.baseline).toBeDefined();
      expect(result.current.baseline.mean).toBeCloseTo(6.2, 1);
      expect(result.current.baseline.standardDeviation).toBeGreaterThan(0);
    });
  });

  test('updates baseline with EWMA calculation', async () => {
    const initialData = generateMoodData(7);
    const newData = [...initialData, { date: '2025-01-08', mood: 9 }];
    
    const { result, rerender } = renderHook(
      ({ data }) => useBaselines(data),
      { initialProps: { data: initialData } }
    );
    
    rerender({ data: newData });
    
    await waitFor(() => {
      expect(result.current.baseline.mean).toBeGreaterThan(6.2);
    });
  });
});
```

### Risk Assessment Testing
**Z-Score Calculation Validation**:

```typescript
// Risk level calculation testing
import { calculateRiskLevel } from '@/utils/riskCalculation';

describe('Risk Assessment', () => {
  test('calculates correct z-score for mood deviation', () => {
    const baseline = { mean: 6.5, standardDeviation: 1.2 };
    const currentMood = 3.0; // Significantly low
    
    const riskLevel = calculateRiskLevel(currentMood, baseline);
    
    expect(riskLevel.zScore).toBeCloseTo(-2.92, 2);
    expect(riskLevel.level).toBe('high');
    expect(riskLevel.color).toBe('destructive');
  });

  test('handles edge cases in risk calculation', () => {
    const baseline = { mean: 5.0, standardDeviation: 0 }; // No variation
    const currentMood = 5.0;
    
    const riskLevel = calculateRiskLevel(currentMood, baseline);
    
    expect(riskLevel.level).toBe('normal');
    expect(riskLevel.zScore).toBe(0);
  });
});
```

## AI Guardian Testing

### Chat Interface Testing
**AI Guardian Interaction Validation**:

```typescript
// AI Guardian chat testing
import { GuardianModal } from '@/components/GuardianModal';

describe('AI Guardian Chat', () => {
  test('displays health context in chat', async () => {
    const mockHealthContext = {
      recentMood: [7, 6, 8, 5],
      sleepAverage: 7.2,
      medicationAdherence: 0.95
    };
    
    render(<GuardianModal healthContext={mockHealthContext} />);
    
    await waitFor(() => {
      expect(screen.getByText(/recent mood trend/i)).toBeInTheDocument();
      expect(screen.getByText(/7.2 hours sleep average/i)).toBeInTheDocument();
    });
  });

  test('handles AI response errors gracefully', async () => {
    // Mock API failure
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<GuardianModal />);
    
    const input = screen.getByPlaceholderText(/ask me anything/i);
    fireEvent.change(input, { target: { value: 'How am I doing?' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
```

### Model Fallback Testing
**Multi-Model Orchestration**:

```typescript
// Test AI model failover
describe('AI Model Fallback', () => {
  test('switches to backup model when primary fails', async () => {
    // Mock primary model failure
    mockOpenRouterAPI.mockRejectedValueOnce(new Error('Model unavailable'));
    
    const { result } = renderHook(() => useAIGuardian());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    // Verify fallback model was used
    expect(mockOpenRouterAPI).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'anthropic/claude-3-sonnet' })
    );
  });
});
```

## Cross-Platform Testing

### Mobile Testing (Capacitor)
**iOS Testing Checklist**:
- [ ] Safe area handling (notch compatibility)
- [ ] VoiceOver accessibility navigation
- [ ] Touch target sizing (44px minimum)
- [ ] Haptic feedback for important actions
- [ ] Background app refresh behavior
- [ ] iOS keyboard handling

**Android Testing Checklist**:
- [ ] Navigation bar handling
- [ ] TalkBack accessibility support
- [ ] Material Design compliance
- [ ] Back button behavior
- [ ] Android-specific permissions
- [ ] Various screen densities

### Browser Compatibility Matrix

**Desktop Testing**:
```typescript
// Playwright cross-browser testing
import { test, expect, devices } from '@playwright/test';

test.describe('Cross-browser compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Dashboard loads correctly on ${browserName}`, async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
      
      // Test critical user flows
      await page.click('[data-testid="add-mood-entry"]');
      await expect(page.locator('[data-testid="mood-form"]')).toBeVisible();
    });
  });
});
```

**Mobile Browser Testing**:
```typescript
// Mobile device simulation
test.describe('Mobile responsiveness', () => {
  test('iPhone 13 layout', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
    });
    const page = await context.newPage();
    
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible();
  });
});
```

## Performance Testing

### Core Web Vitals Monitoring
**Lighthouse CI Integration**:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.js'
          uploadArtifacts: true
```

**Performance Thresholds** (`lighthouserc.js`):
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080/', 'http://localhost:8080/dashboard'],
      startServerCommand: 'npm run preview',
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

### Bundle Size Monitoring
**Webpack Bundle Analyzer**:

```typescript
// Test bundle size impact
describe('Bundle Size', () => {
  test('main bundle should be under 1.5MB', () => {
    const stats = require('../dist/stats.json');
    const mainBundle = stats.assets.find(asset => asset.name.includes('index'));
    
    expect(mainBundle.size).toBeLessThan(1.5 * 1024 * 1024); // 1.5MB
  });
});
```

## Testing Framework Setup

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/types/**',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Testing Utilities
```typescript
// src/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Quality Assurance Workflows

### Pre-Deployment Checklist
**Critical User Journeys**:
- [ ] User registration and login flow
- [ ] Mood entry submission and validation
- [ ] AI Guardian chat interaction
- [ ] Medication tracking workflow
- [ ] Settings configuration and persistence
- [ ] Data visualization accuracy

**Accessibility Validation**:
- [ ] Keyboard navigation through entire app
- [ ] Screen reader compatibility (VoiceOver/NVDA)
- [ ] Color contrast compliance (4.5:1 minimum)
- [ ] Touch target sizing (44px minimum)
- [ ] Focus management in modals and overlays

**Performance Validation**:
- [ ] Lighthouse scores meet thresholds
- [ ] Bundle size under limits
- [ ] Memory leak prevention
- [ ] Offline functionality (PWA features)

### Continuous Integration Setup
**GitHub Actions Workflow**:

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
```

## Internal Testing Panel

The application includes a comprehensive testing interface at `/testing` for manual QA validation:

### Testing Panel Tabs
1. **Validation**: System health check across all components
2. **Accuracy**: Real-time AI performance metrics and trends
3. **Guardian**: AI chat validation with therapeutic appropriateness testing
4. **Documents**: Medical document processing pipeline testing
5. **Controls**: Advanced test data generation and edge case testing
6. **Tables**: Database state management for testing scenarios
7. **Errors**: Error tracking and debugging with detailed stack traces

### Using the Testing Panel
```typescript
// Access the testing panel (requires authentication)
// Navigate to: http://localhost:8080/testing

// Generate test data
const generateTestMoodData = (days: number) => {
  // Creates realistic mood patterns for testing baselines
};

// Validate AI responses
const testAIGuardianResponse = async (prompt: string) => {
  // Tests therapeutic appropriateness and safety
};
```

## Reporting & Metrics

### Test Coverage Requirements
- **Unit Tests**: 70% minimum coverage
- **Integration Tests**: Critical user flows covered
- **E2E Tests**: Happy path and error scenarios
- **Accessibility Tests**: 100% compliance with WCAG AA

### Performance Metrics Tracking
- **Lighthouse Scores**: Automated reporting on each deploy
- **Bundle Size Trends**: Track growth over time
- **Runtime Performance**: Monitor for memory leaks and performance regressions
- **User Experience Metrics**: Real User Monitoring (RUM) when deployed

---

**Remember**: Testing is not just about catching bugs—it's about ensuring the application provides a reliable, accessible, and performant experience for users managing their mental health.