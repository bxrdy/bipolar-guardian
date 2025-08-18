# Testing Guide

**[Documentation Hub](../README.md) > [Developer Documentation](README.md) > Testing**

*Your complete guide to testing, validating, and monitoring the Bipolar Guardian application.*

## What is the Testing Panel?

The Testing Panel is your quality assurance headquarters. It's a protected, developer-focused area of the app where you can test, validate, and monitor every part of the system to ensure everything works perfectly.

With the Testing Panel, you can:
- **Test AI accuracy** to make sure our insights are helpful and correct.
- **Validate document processing** to ensure medical documents are read accurately.
- **Generate realistic test data** without ever using real user information.
- **Track and fix errors** before they affect users.

## Getting Started

1.  **Navigate to `/testing`** in your browser.
2.  **You must be signed in.** The Testing Panel is protected and requires an active user session.

---

## The Seven Testing Tabs

### 1. 🔍 Validation
This is your one-click system health check. It runs a comprehensive suite of tests across the entire application to ensure everything is working correctly.
- **When to use it**: Before deploying new features, after major changes, or when investigating a complex bug.

### 2. 📊 Accuracy
This tab provides a real-time dashboard of our AI's performance. It shows you detailed metrics on how well the AI is performing, complete with charts and trends over time.
- **When to use it**: To monitor AI performance, check if recent changes have improved accuracy, and investigate user feedback about AI responses.

### 3. 🤖 Guardian
This is a specialized area for testing the AI Guardian chat feature. It validates that the AI is providing helpful, safe, and therapeutically appropriate responses.
- **When to use it**: After updating AI models or prompts, or when testing new conversational features.

### 4. 📄 Documents
This tab allows you to generate realistic but fake medical documents to test our document processing pipeline. You can create prescriptions, lab results, therapy notes, and more.
- **When to use it**: To ensure the system can correctly process various types of medical information and trigger the correct AI insights.

### 5. ⚙️ Controls
This tab provides advanced tools for generating specific health data patterns and testing the full data pipeline, from input to insight.
- **When to use it**: For setting up complex test environments, testing edge cases, and validating that data flows correctly through the entire system.

### 6. 🗄️ Tables
This is your database management center for testing. It allows you to safely view and clear test data from the database.
- **When to use it**: To clean up after a testing session or to reset your environment for a new test.

### 7. ❌ Errors
This tab is your error tracking and debugging hub. It shows detailed information about any errors occurring in the system, helping you find and fix problems quickly.
- **When to use it**: When something isn't working as expected, or for regular system health monitoring.

---

## Medical Document Generation

The "Documents" tab includes a powerful system for generating realistic medical documents for testing.

### Core Components
- **Document Templates**: A collection of predefined, realistic medical document formats, including prescriptions, lab results, therapy notes, and more.
- **Test Data Generator**: A set of functions that populate the templates with realistic (but fictional) data.

### How to Use It
- **Quick Generation**: Instantly generate common document types like prescriptions and lab results.
- **AI Insight Triggers**: Generate documents specifically designed to test our AI's analytical capabilities (e.g., a document with an abnormal lab result).
- **Advanced Generation**: Customize and batch-generate documents for more complex testing scenarios.

This system is a critical part of the commitment to building reliable and accurate AI. By testing the system with a wide variety of realistic scenarios, Bipolar Guardian can provide high-quality, trustworthy insights.
