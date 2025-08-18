# Developer Documentation

**Everything you need to contribute to Bipolar Guardian**

## Quick Start

1. **[Complete Setup Guide](SETUP.md)** - Supabase configuration, environment variables, and database setup
2. **[Testing Framework](TESTING.md)** - Quality assurance and validation system
3. **[Accessibility Guide](ACCESSIBILITY.md)** - WCAG 2.1 AA compliance standards

## Development Workflow

### Initial Setup
```bash
git clone https://github.com/bxrdy/bipolar-guardian
cd bipolar-guardian
npm install
```

Follow the [Complete Setup Guide](SETUP.md) for Supabase configuration and environment variables.

### Key Commands
```bash
npm run dev          # Start development server on port 8080
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Testing and Validation
- **Navigate to `/testing`** in the running app for comprehensive validation framework
- **7 Testing tabs** covering validation, accuracy, AI Guardian, documents, controls, tables, and errors
- **Test account:** Create your own (no hardcoded credentials)

See [Testing Guide](TESTING.md) for complete testing documentation.

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript and Vite build system
- **State Management:** TanStack React Query for server state
- **Styling:** Tailwind CSS with shadcn/ui component library
- **Forms:** React Hook Form with Zod validation

### Backend Integration
- **Supabase:** PostgreSQL, authentication, real-time subscriptions
- **Row Level Security:** All tables use RLS policies for user data isolation
- **Edge Functions:** AI processing and data aggregation
- **Security:** Enterprise-grade with PII sanitization and audit trails

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

## Key Development Patterns

### Custom Hooks
Business logic is encapsulated in hooks for reusability:
- `useBaselines.ts` - Personal baseline management
- `useAIInsights.ts` - AI-powered analysis
- `useMoodAnalytics.ts` - Data analysis and trends
- `useIsMobile.ts` - Responsive design patterns

### Data Flow
- **React Query** for server state management with automatic caching
- **Local React state** for UI interactions
- **Supabase real-time** for live updates
- **Edge functions** for complex processing

### Security Patterns
- **Row-Level Security** ensures users only access their own data
- **PII Sanitization** before AI processing
- **Input validation** with Zod schemas
- **Security headers** on all API endpoints

## Contributing Guidelines

### Code Style
- TypeScript with relaxed settings for rapid development
- ESLint with React/TypeScript rules
- Prettier for consistent formatting
- No unused variable warnings (development focus)

### Git Workflow
- Feature branches from `main`
- Descriptive commit messages
- No emoji in commit messages
- Test changes in `/testing` interface

### Pull Request Process
1. Fork and create feature branch
2. Follow existing code patterns
3. Test thoroughly using `/testing` interface
4. Update documentation if needed
5. Submit PR with clear description

## Technical Deep Dive

### Personal Baselines System
- **Minimum 7 days** of data for statistical analysis
- **EWMA calculation** with 15-day half-life for adaptive learning
- **Medication change detection** with context window adjustment
- **Z-score risk calculation** against personal baselines

See [Algorithms Documentation](../technical/ALGORITHMS.md) for mathematical implementations.

### AI Model Integration
- **Multi-model support** with automatic failover
- **Context injection** of last 14 days health data
- **PII sanitization** before AI processing
- **Therapeutic boundaries** with crisis resource routing

### Mobile Development
- **Capacitor** for cross-platform mobile capabilities
- **Responsive design** with mobile-first approach
- **PWA features** for installable web application
- **Touch-friendly interfaces** with proper spacing

## Troubleshooting

### Common Issues
- **Supabase connection errors:** Check environment variables in `.env.local`
- **Edge function failures:** Verify OpenRouter API key in Supabase secrets
- **Build errors:** Ensure Node.js 18+ and clean `npm install`
- **Port conflicts:** Development server runs on port 8080

### Debugging Tools
- **Testing interface** at `/testing` for system validation
- **Browser DevTools** for React Query and network debugging
- **Supabase Dashboard** for database and function monitoring
- **Console logs** with error categorization system

## Next Steps

- **New to the project?** Start with [Complete Setup Guide](SETUP.md)
- **Ready to test?** Follow [Testing Guide](TESTING.md)
- **Need technical details?** Check [Technical Documentation](../technical/)
- **Questions about algorithms?** See [Algorithms](../technical/ALGORITHMS.md)

## Resources

- **[Main Repository](https://github.com/bxrdy/bipolar-guardian)**
- **[Supabase Documentation](https://supabase.com/docs)**
- **[React Query Docs](https://tanstack.com/query/latest)**
- **[shadcn/ui Components](https://ui.shadcn.com/)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**

---

**Need help?** Check the [Documentation Hub](../README.md) for other resources or review specific guides linked above.