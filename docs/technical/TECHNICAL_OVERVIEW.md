# Technical Overview

## Technology Stack

### Frontend Architecture
- **React 18**: Modern UI library with hooks and concurrent features.
- **TypeScript**: For type-safe development and a better developer experience.
- **Vite**: A lightning-fast build tool and development server.
- **Tailwind CSS**: A utility-first CSS framework for rapid styling.
- **shadcn/ui**: A library of high-quality, accessible, and composable UI components.
- **Lucide React**: A beautiful and consistent icon library.
- **Recharts**: A powerful data visualization library for charts and graphs.

### Backend & Database
- **Supabase**: Our complete backend-as-a-service platform.
- **PostgreSQL**: A robust, open-source relational database.
- **Row-Level Security (RLS)**: Fine-grained access control is enforced at the database level.

### AI & Integrations
- **OpenRouter**: Our gateway to a curated set of AI models.
  - **4 primary models** for chat and therapeutic conversation.
  - **2 specialized models** for medical document analysis.
- **Real-Time Model Status**: We monitor model availability and performance in real-time to ensure reliability.

### State Management
- **TanStack React Query**: For powerful server state management, caching, and data synchronization.
- **Zustand**: For lightweight, simple global client state management.
- **React Hook Form & Zod**: For performant, type-safe forms and schema validation.

## Architecture Deep Dive

### Component Structure
Our frontend code is organized for clarity and maintainability:
```
src/
├── components/      # Reusable UI components (auth, guardian, mood, etc.)
├── hooks/           # Custom React hooks for business logic
├── pages/           # Top-level route components
├── integrations/    # Supabase client and type definitions
├── services/        # Client-side services (error tracking, storage)
└── utils/           # Shared utility functions
```

### Data Flow Architecture
User Input → UI Components → State Management (React Query & Zustand) → Supabase Client → PostgreSQL Database → Edge Functions → External APIs (OpenRouter) → Real-time UI Updates

### Edge Functions Pipeline
- **Guardian Chat**: Processes AI conversations with context injection and model fallbacks.
- **Risk Analysis**: Calculates risk levels based on daily data and personal baselines.
- **Data Aggregation**: Creates daily summaries and updates baselines.
- **Accuracy & Validation**: A suite of functions (`analyze-document-accuracy`, `validate-medical-terminology`, etc.) that continuously monitor and score the quality of our AI's analysis.

## Database Schema

### Core Tables
- **profiles**: User profile data and application preferences.
- **mood_entries**: Daily mood, energy, stress, and anxiety tracking.
- **medications** & **medication_logs**: Prescription information and adherence tracking.
- **documents**: Secure storage for medical documents with extracted text.
- **sleep_data**, **step_data**, **screen_time_data**: Passive data collection tables.
- **daily_summaries**: Aggregated health metrics for trend analysis.
- **baselines**: Personalized baseline calculations for each user metric.
- **prediction_events** & **user_feedback**: Tables for tracking AI predictions and user validation, forming the core of our accuracy improvement loop.

### Security
- **Row-Level Security (RLS)** policies are enforced on all sensitive tables, ensuring users can only ever access their own data.
- **Authenticated users** are required for all sensitive operations.
- **API keys** are stored securely in Supabase Edge Function secrets and are never exposed to the client.
