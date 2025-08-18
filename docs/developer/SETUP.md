# Complete Setup Guide

**[Documentation Hub](../README.md) > [Developer Documentation](README.md) > Setup**

## Prerequisites

- **Node.js 18+** - [Install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for version management
- **Supabase Account** - [Sign up for free](https://supabase.com)
- **OpenRouter API Key** - [Get one here](https://openrouter.ai/keys) for AI model access

## 1. Clone and Install

```bash
git clone https://github.com/bxrdy/bipolar-guardian
cd bipolar-guardian
npm install
```

## 2. Supabase Project Setup

### Create New Project
1. Go to [database.new](https://database.new)
2. Create a new project (note the project reference ID)
3. Wait for project initialization to complete

### Configure Environment Variables
Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in your Supabase project: **Settings > API**

## 3. Database Schema Setup

### Link to Your Project
```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

### Apply Database Migrations
```bash
npx supabase db push
```

This creates all necessary tables:
- `profiles` - User accounts and preferences
- `mood_entries` - Daily mood tracking data
- `medications` - Prescription information
- `baseline_metrics` - Personal baseline calculations
- `sensor_samples` - Sleep, activity, and health data
- `medical_documents` - Encrypted document storage

## 4. Edge Functions Deployment

### Deploy All Functions
```bash
npx supabase functions deploy
```

### Configure API Keys
Set up your OpenRouter API key for AI processing:

```bash
npx supabase secrets set OPENROUTER_API_KEY=your_openrouter_key
```

## 5. Development Environment

### Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Create Your Test Account
1. Navigate to the app
2. Click "Sign Up" 
3. Use your own email/password (no hardcoded test credentials)
4. Complete the onboarding flow

## 6. Testing Framework Access

Navigate to `/testing` in your browser for the comprehensive validation framework:

- **🔍 Validation** - System health checks and runlists
- **📊 Accuracy** - AI performance and regression analysis  
- **🤖 Guardian** - Conversational AI quality assurance
- **📄 Documents** - Medical document processing validation
- **⚙️ Controls** - Feature management and data generation
- **🗄️ Tables** - Database integrity inspection
- **❌ Errors** - Exception tracking and debugging

## 7. Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint checking (run before commits)
npm run preview      # Preview production build locally
```

## Troubleshooting

### Common Issues

**Supabase Connection Errors**
- Verify your project URL and anon key in `.env.local`
- Check that your project is active in the Supabase dashboard

**Edge Function Deployment Failures**  
- Ensure you're logged in: `npx supabase login`
- Verify project linking: `npx supabase link --project-ref your-ref`

**AI Models Not Responding**
- Confirm OpenRouter API key is set in Supabase secrets
- Check Edge Function logs in your Supabase dashboard

**Database Migration Issues**
- Reset if needed: `npx supabase db reset`
- Reapply migrations: `npx supabase db push`

### Getting Help

- Check the [GitHub Issues](https://github.com/bxrdy/bipolar-guardian/issues) for known issues
- Review Edge Function logs in your Supabase dashboard
- Use the `/testing` framework to validate your setup