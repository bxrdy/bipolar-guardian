# User Guide

**[Documentation Hub](README.md) > User Guide**

*If you're here, you might be curious about this project but aren't sure what terms like "digital phenotyping" or "EWMA" actually mean. That's perfectly normal! This guide explains everything in everyday language.*

## What This Project Is About

Bipolar Guardian is a digital tool designed to help people with bipolar disorder better understand their own patterns and catch potential mood episodes before they become overwhelming.

Think of it like this: your smartphone learns your habits over time—when you usually wake up, which apps you use most, where you go regularly. Bipolar Guardian does something similar but for mental health, tracking things like sleep patterns, mood, and energy levels to understand what "normal" looks like for each individual person.

## Why "Personal Normal" Matters

Here's something important: everyone's "normal" is different. 

If you naturally need 9 hours of sleep to feel rested, then 6 hours might be a warning sign for you—even though 6 hours might be perfectly fine for someone else. Most health apps use population averages ("most people need 7-8 hours of sleep"), but this project takes a different approach: it learns *your* patterns specifically.

This matters because bipolar disorder episodes often start with subtle changes that are easy to miss. Maybe your sleep gets irregular a few days before a mood episode, or your activity level drops in a particular pattern. These early signs are much easier to spot when you have a clear picture of your personal baseline.

## The Technology Challenge

Building something like this involves several interesting problems:

**The Learning Problem**: How do you teach a computer to recognize patterns in something as complex and personal as mental health? It needs to adapt when your life changes (new medication, job stress, seasonal changes) without forgetting what it learned about you.

**The AI Problem**: How do you create a supportive, knowledgeable companion that can help interpret these patterns? The AI needs access to your health data to provide meaningful insights, but it also needs to be reliable—available when you need it, even if one system goes down.

**The Trust Problem**: How do you build something that people feel comfortable sharing sensitive health information with? This involves both technical security (protecting your data) and transparency (explaining how decisions are made).

## How the AI Component Works

The AI Guardian acts like a knowledgeable, always-available companion who understands your specific health patterns. When you chat with it, it automatically (and securely) considers your recent mood entries, sleep data, medications, and how your current metrics compare to your personal baselines.

Instead of generic advice, it might say something like: "I notice your sleep has been inconsistent this week, averaging 5.2 hours when your baseline is 7.5 hours. Combined with your recent stress levels, this might be worth discussing with your care team."

The system uses multiple AI models as backups—if one becomes unavailable, it automatically switches to another while keeping the full context of your conversation.

## The Technical Innovation

The most interesting part technically is the "adaptive personal baselines" system. Instead of comparing you to population averages, it:

1. **Learns your individual patterns** from at least 7 days of data
2. **Adapts over time** using something called exponentially weighted moving averages (giving more importance to recent patterns while remembering historical context)
3. **Adjusts for life changes** like medication switches or major schedule changes
4. **Calculates risk levels** by comparing your current state to your personal normal

This creates a system that becomes more accurate and useful the longer you use it, because it's always refining its understanding of your unique patterns.

## The Bigger Picture

Mental health technology is at an interesting crossroads. AI and wearable devices are becoming sophisticated enough to provide genuinely helpful insights, but there's still a huge gap between what's technically possible and what's actually safe and useful for real people.

This project explores how to bridge that gap—building something technically sophisticated enough to provide meaningful insights, while being transparent about its limitations and maintaining clear boundaries about what it can and cannot do.

It's not meant to replace professional care, but rather to help people better understand their own patterns and have more informed conversations with their healthcare providers.

## Want to Explore the Technical Details?

If this overview has sparked your curiosity about how these systems actually work, here are some good next steps:

- **[Setup Guide](developer/SETUP.md)** - Try running the system yourself
- **[Algorithm Details](technical/ALGORITHMS.md)** - The math behind personal baselines
- **[System Architecture](technical/ARCHITECTURE.md)** - How all the pieces fit together
- **[Research Background](https://doi.org/10.5281/zenodo.16800716)** - The academic foundation

The main README contains the technical overview if you're ready to dive into implementation details.

## Questions or Thoughts?

This is an open-source project, which means the code is freely available for anyone to study, use, or improve. If you have questions, suggestions, or just want to share your thoughts, feel free to open an issue on GitHub or explore the code.

Mental health technology is an area where diverse perspectives and careful thinking really matter, so all constructive input is welcome.

## Next Steps

### Ready to Try It?
- **[Getting Started](GETTING_STARTED.md)** - Quick setup and first steps
- **[Developer Setup](developer/SETUP.md)** - Complete configuration guide

### Want to Learn More?
- **[Technical Documentation](technical/)** - Algorithms and system architecture
- **[Clinical Validation](CLINICAL_VALIDATION.md)** - Research pathway and evidence base

### Interested in Contributing?
- **[Developer Documentation](developer/)** - Setup, testing, and contribution guides
- **[GitHub Repository](https://github.com/bxrdy/bipolar-guardian)** - Source code and issues

---

**Need help navigating?** Return to the [Documentation Hub](README.md) for all available resources.