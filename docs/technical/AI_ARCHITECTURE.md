# AI Architecture

## How the AI Guardian Works

The AI Guardian is more than just a chatbot; it's a sophisticated therapeutic companion with secure, real-time access to your health data, enabling truly personalized support and insights.

## Intelligent Data Access System

When you start a conversation, the AI system automatically and securely gathers context from multiple database tables to inform its responses.

### Data Sources
- **User Profile**: Your preferences, settings, and onboarding responses.
- **Mood Entries**: The last 14 days of mood, energy, stress, and anxiety tracking.
- **Daily Summaries**: The past week of aggregated health metrics.
- **Medications**: Your current prescriptions, schedules, and adherence patterns.
- **Medical Documents**: Securely uploaded files with extracted text content.
- **Sleep & Activity Data**: Recent sleep duration, quality, and movement patterns.

### Context Building Process
The system queries these tables in real-time, building a comprehensive picture of your current state. It compares recent patterns against your established baselines to understand whether you're having a good day, struggling, or somewhere in between. This context is securely passed to the AI to provide relevant and empathetic responses.

## Smart Fallback & Multi-Model System

We know that AI services can sometimes be unreliable. That's why we've built an intelligent system that ensures you always have access to support.

### How It Works
1.  **Primary Model**: The system first tries your preferred AI model (e.g., Claude 3.5 Sonnet).
2.  **Automatic Detection**: If the primary model is unavailable, the system instantly detects this.
3.  **Seamless Switch**: It automatically falls back to a high-quality alternative model.
4.  **Friendly Handover**: You get a clear, friendly message letting you know that a backup Guardian is stepping in.
5.  **Context Preservation**: The conversation continues naturally with all your data and context fully preserved.

### Available Models
For its MVP phase, the system relies on a curated set of best-in-class models:
- **For Chat**: 4 primary models, including Anthropic's Claude 3.5 Sonnet and Google's Gemini.
- **For Document Analysis**: 2 specialized models fine-tuned for extracting and understanding medical information.

## Therapeutic Prompt Engineering

The AI is specifically engineered to be a therapeutic companion, not just a conversationalist.

### System Prompt Design
- **Expert Positioning**: The AI is framed as a knowledgeable and empathetic companion with expertise in bipolar disorder support.
- **Therapeutic Frameworks**: It incorporates principles from Cognitive Behavioral Therapy (CBT) and Dialectical Behavior Therapy (DBT) to guide conversations constructively.
- **Safety Boundaries**: Strict guidelines prevent the AI from giving medical advice, instead encouraging users to consult with their healthcare providers.
- **Context Integration**: Your personal data is woven into conversations naturally and securely.

### Example Interactions
Instead of generic responses, the AI provides personalized insights:
- "I notice your sleep has been inconsistent this week, averaging 5.2 hours when your baseline is 7.5 hours..."
- "Your mood entries show some stress this week. Would you like to talk about what's been happening?"
- "You've been taking your medication consistently—that's fantastic progress!"

## Real-Time Processing & Validation Pipeline

Our architecture is built for real-time analysis and continuous quality improvement.

### Edge Functions Pipeline
- **Context Gathering**: Queries multiple tables to build conversation context.
- **Model Status Checking**: Monitors AI model availability in real-time.
- **Document & Accuracy Analysis**: A suite of functions (`analyze-document-accuracy`, `validate-medical-terminology`, `evaluate-therapeutic-response`) work in the background to ensure the quality and accuracy of the data the AI uses.
- **Response Processing**: Ensures all AI responses adhere to therapeutic and safety guidelines.

### Data Flow
User Message → Context Gathering → Model Selection → AI Processing → Response Filtering & Validation → User Response

This architecture ensures that every conversation is informed, personalized, and therapeutically sound.
