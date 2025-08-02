# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bipolar Guardian is a comprehensive mental health monitoring application designed for individuals managing bipolar disorder. It combines React 18/TypeScript frontend with Supabase backend, featuring AI-powered analysis through 20+ models via OpenRouter.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on port 8080
npm run build        # Production build
npm run build:dev    # Development build 
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Testing Setup
The app includes a comprehensive 7-tab testing panel at `/testing` with test account:
- Email: `tester01@bipolar-guardian.dev`
- Password: `Test1234!`

**Testing Tabs:**
1. **🔍 Validation** - One-click system health check
2. **📊 Accuracy** - AI performance metrics dashboard
3. **🤖 Guardian** - AI Guardian chat validation
4. **📄 Documents** - Medical document processing tests
5. **⚙️ Controls** - Advanced data generation tools
6. **🗄️ Tables** - Database management for testing
7. **❌ Errors** - Error tracking and debugging

## Architecture Overview

### Frontend Structure
- **React 18** with TypeScript and Vite build system
- **Component Organization**: 
  - `src/components/` - Feature-specific components organized by domain
  - `src/components/ui/` - shadcn/ui base components
  - `src/hooks/` - Custom React hooks for business logic
  - `src/pages/` - Route-level components
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library

### Backend Integration
- **Supabase**: Complete backend with PostgreSQL, auth, real-time subscriptions
- **Row Level Security**: All tables use RLS policies for user data isolation
- **Edge Functions**: Located in `supabase/functions/` for AI processing and data aggregation
- **Database Schema**: Key tables include profiles, mood_entries, medications, daily_summaries, baselines

### AI Guardian System
- **Multi-model Support**: 20+ AI models through OpenRouter API
- **Context Injection**: AI automatically receives user's health data (last 14 days of mood entries, medications, sleep data, etc.)
- **Smart Fallback**: Automatic model switching when primary model is unavailable
- **Therapeutic Prompting**: Specialized system prompts for mental health support

### Mobile Support
- **Capacitor**: Cross-platform mobile app capabilities
- **Responsive Design**: Mobile-first approach with `useIsMobile()` hook
- **PWA Ready**: Installable web application with offline capabilities

## Key Components & Patterns

### Screen Navigation
- **ScreenRouter**: Central routing component managing app screens and modals
- **Screen Types**: `'login' | 'onboarding-step1' | 'onboarding-step2' | 'onboarding-step3' | 'dashboard' | 'data-streams' | 'health-data' | 'settings' | 'medications' | 'guardian'`
- **Modal Management**: Centralized in ModalsContainer for trends, guardian chat, mobile sidebar

### Data Flow Patterns
- **Custom Hooks**: Business logic encapsulated in hooks (e.g., `useSettingsState`, `useAIInsights`, `useMoodAnalytics`)
- **React Query**: Server state management with automatic caching and synchronization
- **Form Handling**: React Hook Form with Zod validation

### Authentication Flow
- **Supabase Auth**: Email/password authentication with optional biometric enrollment
- **SessionManager**: Handles auth state and user data persistence
- **Protected Routes**: AuthenticatedApp component wraps main application

## Database Considerations

### Personal Baselines System
- Requires minimum 7 days of data per metric for statistical analysis
- Calculates mean and standard deviation for personalized normal ranges
- Risk analysis compares current metrics against individual baselines

### Key Tables
- **mood_entries**: Daily mood, energy, stress, anxiety (1-10 scale)
- **daily_summaries**: Aggregated daily health metrics
- **baselines**: Statistical baselines for each user's metrics
- **medications**: Prescription tracking with schedules
- **sleep_data, step_data, screen_time_data**: Health monitoring data

## Configuration

### Environment Variables
- Supabase credentials managed through Vite environment variables
- OpenRouter API key stored in Supabase Edge Function secrets

### TypeScript Configuration
- Path aliases: `@/*` maps to `./src/*`
- Relaxed TypeScript settings for rapid development (noImplicitAny: false)

### Build Configuration
- **Vite**: Fast development with SWC React plugin
- **ESLint**: Standard React/TypeScript rules with unused vars disabled
- **Tailwind**: Utility-first CSS with component library integration

## AI Model Management

### Model Selection System
- Real-time status monitoring for 20+ AI models
- User preference storage in database
- Automatic fallback hierarchy when preferred models unavailable
- Model configurations in `src/components/settings/modelConfigurations.ts`

### Guardian Chat Integration
- Context automatically includes last 14 days of user health data
- Therapeutic system prompts specialized for bipolar disorder support
- Edge function `guardian-chat` handles AI processing and context injection

## Mobile Development

### Capacitor Integration
- Cross-platform native functionality for iOS/Android
- Biometric authentication support
- Push notification capabilities

### Responsive Design Patterns
- `useIsMobile()` hook for conditional rendering
- Mobile-specific components (BottomNavigation, MobileSidebarMenu)
- Touch-friendly interfaces with proper spacing

## Personal Analytics & Baseline System

### Key Components for AI Assistance
When working with baseline and analytics features, be aware of these key components:

**Core Hooks:**
- `src/hooks/useBaselines.ts` - Manages baseline data, comparisons, and recalculation
- `src/hooks/usePersonalInsights.ts` - Analyzes weekly patterns and correlations  
- `src/hooks/useBaselineEvolution.ts` - Tracks baseline history and changes over time

**Main Components:**
- `src/components/settings/PersonalBaselineSection.tsx` - Current baseline display with comparisons
- `src/components/settings/PersonalInsightsSection.tsx` - Weekly patterns and trend analysis
- `src/components/settings/BaselineEvolutionSection.tsx` - Historical baseline timeline
- `src/components/settings/HealthDataSection.tsx` - Container for all analytics sections

**Edge Functions:**
- `supabase/functions/calculate-baseline/` - Initial baseline calculation
- `supabase/functions/recalculate-baseline/` - Dynamic baseline updates with weighted algorithms
- `supabase/functions/scheduled-baseline-updates/` - Automated monthly recalculation
- `supabase/functions/guardian-chat/` - AI chat processing with health context
- `supabase/functions/check-model-status/` - Real-time AI model availability
- `supabase/functions/extract-doc-text/` - Medical document text extraction
- `supabase/functions/analyze-document-accuracy/` - Document processing validation
- `supabase/functions/evaluate-therapeutic-response/` - AI response quality assessment

### Database Schema Updates
When modifying baseline-related features, be aware of:

**Enhanced Tables:**
- `baseline_metrics` - Added calculation_method, window_days, medication_changes_detected fields
- `baseline_history` - New table for baseline versioning and change tracking

**Migration Files:**
- `supabase/migrations/20250627120000-baseline-history-table.sql` - Baseline history schema

### Development Patterns
**State Management:** All baseline components use React Query for caching and synchronization
**Error Handling:** Components gracefully handle missing baseline data (users with <7 days data)
**Loading States:** All analytics components include skeleton loading states
**Mobile Optimization:** Components use `useIsMobile()` hook for responsive design

### Common Tasks
**Adding New Metrics:** Update both `useBaselines.ts` comparison logic and baseline calculation functions
**UI Updates:** Most analytics displays are in `PersonalBaselineSection.tsx` and related components
**Algorithm Changes:** Core algorithms are in Edge functions, not frontend code
**Database Changes:** Use migrations in `supabase/migrations/` for schema updates

## Development Workflows

### File Structure Patterns
- **Custom Hooks**: All business logic should be encapsulated in hooks (`src/hooks/`)
- **Component Organization**: Feature-specific components in domain folders (e.g., `guardian/`, `medications/`, `testing/`)
- **Shared Components**: Reusable UI components in `src/components/ui/` using shadcn/ui
- **Type Definitions**: Domain types in `src/types/` and `src/integrations/supabase/types/`

### Security Considerations
- **Row Level Security**: All database tables use RLS policies for user isolation
- **PII Sanitization**: Shared functions in `supabase/functions/_shared/sanitization.ts`
- **Input Validation**: Centralized validation in `supabase/functions/_shared/inputValidator.ts`
- **Rate Limiting**: Protection via `supabase/functions/_shared/rateLimiter.ts`
- **Security Headers**: Applied via `supabase/functions/_shared/securityHeaders.ts`

### Error Handling & Monitoring
- **Error Classification**: Automatic error categorization in `src/services/error/`
- **Error Sanitization**: PII removal before logging via `src/utils/errorSanitizer.ts`
- **Security Monitoring**: Real-time security event tracking in `src/components/security/`

### Mobile Development Notes
- **Capacitor Config**: App ID `app.lovable.9bb52d124e614a8fab49923e9277d6d8`
- **Port Configuration**: Development server runs on port 8080
- **Responsive Design**: Use `useIsMobile()` hook for conditional rendering
- **Touch Interfaces**: Mobile-specific components in `components/navigation/`

### Database Development
- **Migrations**: Located in `supabase/migrations/` with timestamp naming
- **Baseline System**: Requires minimum 7 days of data for statistical analysis
- **Edge Functions**: Shared utilities in `supabase/functions/_shared/`

### AI Model Integration
- **Model Status**: Real-time monitoring via `check-model-status` edge function
- **Context Injection**: Automatic health data inclusion (last 14 days)
- **Fallback System**: Automatic model switching when primary unavailable
- **Configuration**: Model settings in `src/components/settings/modelConfigurations.ts`

This architecture supports a comprehensive mental health platform with sophisticated AI integration, statistical analysis, and cross-platform capabilities.