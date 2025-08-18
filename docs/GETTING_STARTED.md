# Getting Started

**[Documentation Hub](README.md) > Getting Started**

**Quick overview of Bipolar Guardian and basic setup instructions**

## What is Bipolar Guardian?

Bipolar Guardian is an adaptive digital phenotyping system for individuals managing bipolar disorder. Instead of using population averages, it learns your individual patterns and creates personalized baselines that evolve with life changes.

**Key Features:**
- **Personal Baseline Learning** - Understands your unique "normal" patterns
- **Multi-Model AI Guardian** - Resilient AI companion with automatic failover
- **Comprehensive Tracking** - Mood, sleep, medications, and activity monitoring
- **Risk Assessment** - Compares current state to your personal baselines
- **Enterprise Security** - Row-level security and PII sanitization

## Quick Setup

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- OpenRouter API key for AI models

### 5-Minute Setup
```bash
# Clone and install
git clone https://github.com/bxrdy/bipolar-guardian
cd bipolar-guardian
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the app running.

**Note:** You'll need to configure Supabase and API keys for full functionality. See [Complete Setup Guide](developer/SETUP.md) for detailed instructions.

## First Steps After Setup

1. **Create an account** - Use your own email (no test credentials needed)
2. **Visit `/testing`** - Explore the comprehensive validation framework
3. **Try the AI Guardian** - Chat interface with health context awareness
4. **Add some data** - Mood entries, sleep data, or medication tracking
5. **Check baselines** - Personal analytics appear after 7+ days of data

## Understanding the System

### Personal Baselines
The system calculates your individual "normal" ranges for metrics like mood, energy, and sleep. After 7 days of data, it uses exponentially weighted moving averages (EWMA) to create adaptive baselines that:
- Give more weight to recent patterns
- Adjust for medication changes
- Maintain historical context
- Calculate personalized risk levels

### AI Guardian
The AI companion automatically receives your recent health data (last 14 days) to provide contextual guidance. It uses multiple AI models with smart fallback when primary models are unavailable.

### Development vs Clinical Use
**Current Status:** MVP with sophisticated algorithmic validation suitable for development and quality assurance.

**Not Clinical Validation:** The system cannot make medical accuracy claims without substantial additional investment in expert validation and clinical studies. See [Clinical Validation Roadmap](CLINICAL_VALIDATION.md) for the evidence-based path to FDA compliance.

## Next Steps

### For Users
- **Learn the concepts:** [User Guide](USER_GUIDE.md) explains everything in plain language
- **Understand the technology:** [Technical Documentation](technical/) for implementation details

### For Developers
- **Complete setup:** [Developer Setup Guide](developer/SETUP.md) with Supabase configuration
- **Testing framework:** [Testing Guide](developer/TESTING.md) for quality assurance
- **Contribute:** Follow setup instructions and explore the codebase

### For Researchers
- **Clinical pathway:** [Clinical Validation](CLINICAL_VALIDATION.md) outlines research requirements
- **Algorithm details:** [Algorithms](technical/ALGORITHMS.md) with mathematical implementations
- **System architecture:** [Architecture](technical/ARCHITECTURE.md) for system design

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Getting Help

- **Setup issues?** → [Developer Setup](developer/SETUP.md)
- **Need to understand concepts?** → [User Guide](USER_GUIDE.md)
- **Want to contribute?** → [Developer Documentation](developer/)
- **Research questions?** → [Clinical Validation](CLINICAL_VALIDATION.md)

---

**Ready to dive deeper?** The [Documentation Hub](README.md) has paths for every type of user, from newcomers to clinical researchers.