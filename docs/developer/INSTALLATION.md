# Installation & Setup

This guide provides instructions for setting up the Bipolar Guardian project for local development.

## Prerequisites
- **Node.js**: v18 or higher is recommended. [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) is great for managing Node versions.
- **Package Manager**: This project uses `npm`, but `yarn`, `pnpm`, or `bun` will also work.
- **Supabase Account**: You'll need a free Supabase account for the backend services.

## Local Development Setup

### 1. Clone and Install

First, clone the repository to your local machine and install the dependencies.

```bash
git clone <YOUR_GIT_URL>
cd bipolar-guardian
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project. You'll need to add your Supabase project URL and anon key to this file. You can find these in your Supabase project settings under "API".

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Development Server

Once your environment variables are set, you can start the local development server.

```bash
npm run dev
```

This will start the app, typically on [http://localhost:5173](http://localhost:5173).

## Important Development Scripts

- **`npm run dev`**: Starts the development server with hot-reloading.
- **`npm run build`**: Builds the application for production.
- **`npm run lint`**: Runs the ESLint checker to find and fix code quality issues. It's highly recommended to run this before committing any changes.
- **`npm run preview`**: Serves the production build locally to preview it before deployment.

## Supabase Configuration

The application relies on a few Supabase Edge Functions for its AI features. To get them working, you'll need to add your **OpenRouter API key**.

1.  Sign up for a free account at [OpenRouter.ai](https://openrouter.ai).
2.  Get your API key from your OpenRouter dashboard.
3.  In your Supabase project, navigate to **Edge Functions** > **Settings**.
4.  Add a new secret named `OPENROUTER_API_KEY` and paste your key as the value.

The database migrations are located in the `supabase/migrations` folder and will be applied automatically when you set up your Supabase project, creating all the necessary tables.

## Mobile Development (Capacitor)

This project uses Capacitor to enable native mobile functionality. While not required for web development, if you plan to build for iOS or Android, you will need to have the respective development environments (Xcode for iOS, Android Studio for Android) set up.
