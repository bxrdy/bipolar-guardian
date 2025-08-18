# System Architecture

## High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   React 18 App  │    │  Supabase Stack  │    │   AI Model Router   │
│                 │    │                  │    │                     │
│ • TypeScript    │◄──►│ • PostgreSQL     │◄──►│ • OpenRouter API    │
│ • Tailwind CSS  │    │ • Row-Level      │    │ • Multi-model       │
│ • shadcn/ui     │    │   Security       │    │   fallback          │
│ • React Query   │    │ • Edge Functions │    │ • Context preserve  │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## Frontend Architecture

### Component Organization
```
src/
├── components/
│   ├── ui/           # shadcn/ui base components  
│   ├── guardian/     # AI chat interface
│   ├── testing/      # Validation framework
│   ├── settings/     # Baseline & analytics UI
│   └── navigation/   # Mobile/desktop navigation
├── hooks/            # Business logic hooks
├── pages/            # Route-level components  
└── types/            # TypeScript definitions
```

### State Management Pattern
- **Server State**: TanStack React Query for caching and synchronization
- **UI State**: Local React state with custom hooks
- **Form State**: React Hook Form with Zod validation

## Backend Architecture

### Database Schema
```sql
-- Core user data with RLS policies
profiles              -- User accounts, preferences, onboarding data
mood_entries          -- Daily mood, energy, stress, anxiety (1-10 scale)
medications           -- Prescriptions with schedules and adherence
daily_summaries       -- Aggregated daily health metrics

-- Sensor and health data
sensor_samples        -- Sleep, activity, screen time measurements
sleep_data            -- Detailed sleep tracking
step_data             -- Physical activity monitoring
screen_time_data      -- Digital wellness metrics

-- AI and analytics
baseline_metrics      -- Personal baselines (μ, σ) per user
baseline_history      -- Baseline versioning and change tracking
medical_documents     -- Encrypted clinical document storage

-- All tables use Row-Level Security for user data isolation
```

### Edge Functions
```
supabase/functions/
├── guardian-chat/              # AI conversation processing
├── recalculate-baseline/       # EWMA baseline updates
├── calculate-baseline/         # Initial baseline bootstrap
├── check-model-status/         # Real-time AI model availability
├── extract-doc-text/           # Medical document text extraction
├── analyze-document-accuracy/  # Document processing validation
└── _shared/                    # Common utilities
    ├── sanitization.ts         # PII removal
    ├── inputValidator.ts       # Input validation
    ├── rateLimiter.ts          # Rate limiting
    └── securityHeaders.ts      # Security headers
```

## AI Integration Architecture

### Multi-Model Orchestration
```typescript
interface ModelRouter {
  primary: string;           // Preferred model (e.g., "claude-3.5-sonnet")
  fallbacks: string[];       // Backup models in priority order
  context: HealthContext;    // Sanitized user health data
}

// Automatic failover with context preservation
async function processChat(query: string): Promise<AIResponse> {
  const context = await assembleHealthContext(userId);
  const sanitizedContext = sanitizePII(context);
  
  for (const model of [primary, ...fallbacks]) {
    try {
      return await callModel(model, query, sanitizedContext);
    } catch (error) {
      // Log error, try next model
      continue;
    }
  }
  
  throw new Error("All models unavailable");
}
```

### Context Assembly
Health context automatically includes:
- **User Profile**: Preferences, settings, therapeutic goals
- **Recent Health Data**: Last 14 days of mood entries, medication adherence
- **Baseline Comparisons**: Current metrics vs. personal baselines  
- **Risk State**: Current risk level and contributing factors
- **Medical History**: Processed clinical documents (if uploaded)

## Security Architecture

### Data Protection
- **Row-Level Security**: All database queries filtered by authenticated user ID
- **PII Sanitization**: Personal data removed before AI processing
- **Encryption**: Medical documents encrypted at rest
- **Session Management**: Secure authentication with automatic logout

### AI Safety Measures
- **Therapeutic Boundaries**: System prompts prevent medical advice
- **Crisis Routing**: Automatic detection and resource routing
- **Response Validation**: Edge functions validate AI responses for safety
- **Audit Logging**: All AI interactions logged for quality assurance

## Mobile Architecture

### Cross-Platform Support
- **Capacitor**: Native iOS/Android functionality
- **Progressive Web App**: Installable with offline capabilities
- **Responsive Design**: Mobile-first UI with `useIsMobile()` hook
- **Touch Interfaces**: Mobile-specific navigation and interactions

## Performance Architecture

### Optimization Strategies
- **Code Splitting**: Dynamic imports for route-based chunks
- **React Query**: Intelligent caching and background updates
- **Skeleton Loading**: Graceful loading states for all async operations
- **Lazy Loading**: Components and routes loaded on demand

### Monitoring
- **Real-time Validation**: 7-panel testing framework in production
- **Error Tracking**: Centralized error logging and classification
- **Performance Metrics**: Core Web Vitals monitoring
- **Security Events**: Real-time security monitoring dashboard

## Deployment Architecture

### Development Workflow
```bash
# Local development
npm run dev              # Vite dev server on :5173

# Testing validation  
/testing                 # 7-panel validation framework

# Production build
npm run build           # Optimized production bundle
npm run preview         # Preview production build locally
```

### Supabase Integration
- **Database Migrations**: Version-controlled schema changes
- **Edge Function Deployment**: Serverless AI processing
- **Real-time Subscriptions**: Live data updates
- **CDN Distribution**: Global edge network for performance

This architecture supports rapid development and iteration while maintaining production-quality security, performance, and user experience standards.