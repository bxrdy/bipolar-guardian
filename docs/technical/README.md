# Technical Documentation

**Deep dive into algorithms, architecture, and implementation details**

## Overview

This section contains technical documentation for developers, researchers, and engineers interested in the mathematical foundations and system architecture of Bipolar Guardian.

## Contents

### [System Architecture](ARCHITECTURE.md)
Complete system design overview including:
- **Frontend Architecture** - React 18, TypeScript, component organization
- **Backend Integration** - Supabase, PostgreSQL, Row-Level Security
- **Data Pipeline** - EWMA calculations, risk assessment, multi-model AI
- **Security Framework** - PII sanitization, encryption, audit trails
- **Mobile Architecture** - Capacitor, PWA capabilities, responsive design

### [Algorithm Implementation](ALGORITHMS.md)
Mathematical implementations with code references:
- **Personal Baseline Calculation** - Bootstrap statistics and EWMA formulas
- **Dynamic Recalibration** - Medication-aware windowing and weight calculations
- **Risk Scoring Pipeline** - Z-score calculations and weighted aggregation
- **Statistical Methods** - Confidence intervals, significance testing
- **Context Window Adjustment** - Adaptive learning with life change detection

## Key Technical Concepts

### Adaptive Personal Baselines
Unlike population-based approaches, Bipolar Guardian creates individual baselines using:
- **Exponentially Weighted Moving Averages (EWMA)** with 15-day half-life
- **Context-aware windowing** that adjusts for medication changes
- **Statistical significance testing** with confidence intervals
- **Medication change detection** that temporarily shortens effective windows

### Multi-Model Orchestration
Resilient AI system with:
- **State-preserving fallback** maintains context across model failures
- **Automatic model selection** based on real-time availability
- **PII sanitization** before AI processing
- **Therapeutic boundary enforcement** with crisis resource routing

### Security Architecture
Enterprise-grade security including:
- **Row-Level Security (RLS)** ensures data isolation per user
- **PII minimization** in AI prompts with health context preservation
- **Encrypted storage** for medical documents with audit trails
- **Session hardening** with device fingerprinting and active monitoring

## Mathematical Foundations

### EWMA Formula
```
weight = exp(-d * ln(2) / 15)
```
Where `d` is days difference and `15` is the half-life in days.

### Z-Score Risk Calculation
```
z = (current_value - personal_mean) / personal_std
risk_level = weighted_aggregation(z_scores)
```

### Weighted Statistics
```typescript
// Weighted mean calculation
const weightedSum = dataPoints.reduce((sum, point) => 
  sum + (point.value * point.weight), 0
);
const totalWeight = dataPoints.reduce((sum, point) => 
  sum + point.weight, 0
);
const weightedMean = weightedSum / totalWeight;
```

## Implementation Patterns

### Custom Hooks Architecture
Business logic encapsulated in reusable hooks:
- `useBaselines.ts` - Personal baseline management and calculations
- `useBaselineEvolution.ts` - Historical baseline tracking
- `usePersonalInsights.ts` - Weekly pattern analysis and correlations
- `useAIInsights.ts` - Multi-model AI interaction management

### Edge Function Design
Serverless functions for complex processing:
- `calculate-baseline/` - Initial 7-day bootstrap calculation
- `recalculate-baseline/` - Dynamic EWMA updates with medication detection
- `guardian-chat/` - AI processing with sanitized health context
- `check-model-status/` - Real-time AI model availability monitoring

### Database Schema Design
Optimized for personal analytics:
- **Temporal tables** with efficient time-range queries
- **Baseline versioning** for historical comparison
- **Medication change tracking** for context window adjustment
- **Audit logging** for all baseline recalculations

## Performance Considerations

### Calculation Efficiency
- **Incremental updates** avoid full recalculation
- **Cached baselines** reduce computational overhead
- **Asynchronous processing** for non-blocking user experience
- **Optimized queries** with proper indexing strategies

### Scalability Design
- **Edge function parallelization** for concurrent processing
- **Database partitioning** by user and time ranges
- **CDN distribution** for global availability
- **Auto-scaling infrastructure** via Supabase platform

## Research Integration

### Clinical Validation Pathway
Technical requirements for healthcare claims:
- **Ground truth integration** with medical datasets (MIMIC-III, i2b2)
- **Expert validation pipeline** with inter-rater reliability measurement
- **Clinical outcome correlation** with longitudinal studies
- **Statistical power analysis** with appropriate sample sizes

### Algorithm Validation
Current validation approach:
- **Pattern-based assessment** against medical language patterns
- **Regression testing** for algorithmic consistency
- **A/B testing framework** for algorithm improvements
- **Quality assurance metrics** for development monitoring

## Next Steps

### For Developers
- **Understanding the codebase?** Start with [Architecture](ARCHITECTURE.md)
- **Implementing new algorithms?** Review [Algorithm Documentation](ALGORITHMS.md)
- **Contributing to baselines?** Check the Edge Functions in `supabase/functions/`

### For Researchers
- **Clinical validation pathway?** See [Clinical Validation](../CLINICAL_VALIDATION.md)
- **Algorithm analysis?** Review mathematical implementations in [Algorithms](ALGORITHMS.md)
- **System evaluation?** Study the architecture patterns in [Architecture](ARCHITECTURE.md)

### For Data Scientists
- **Baseline algorithms?** Deep dive into EWMA implementations
- **Risk scoring methods?** Analyze Z-score aggregation approaches
- **Pattern recognition?** Explore medication change detection algorithms

## External References

- **Digital Phenotyping:** [Onnela & Rauch (2016)](https://www.nature.com/articles/npp2016262)
- **Wearable Predictors:** [Lim et al. (2024)](https://www.nature.com/articles/s41746-024-01349-6)
- **Personalization Frameworks:** [Song et al. (2024)](https://mental.jmir.org/2024/1/e59512)
- **Exponentially Weighted Moving Averages:** Statistical foundations and applications
- **Row-Level Security:** PostgreSQL security patterns for multi-tenant applications

---

**Need specific implementation details?** Each document includes code references with line numbers and file paths for direct navigation to implementations.