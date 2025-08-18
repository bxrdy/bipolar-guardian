# Algorithm Implementation Details

This document details the mathematical algorithms implemented in Bipolar Guardian, with references to the actual code implementations.

## Personal Baseline Calculation

### Initial Bootstrap (7+ days required)
```typescript
// Standard mean and standard deviation calculation
const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
const sd = Math.sqrt(variance);
```

### Dynamic Recalibration with EWMA

**Formula:** `weight = exp(-d * ln(2) / 15)`

**Implementation:** [`supabase/functions/recalculate-baseline/index.ts:62-65`](../../supabase/functions/recalculate-baseline/index.ts)
```typescript
function calculateWeight(dataDate: Date, today: Date, halfLifeDays: number = 15): number {
  const daysDiff = Math.abs((today.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.exp(-daysDiff * Math.log(2) / halfLifeDays);
}
```

**Weighted Statistics:** [`supabase/functions/recalculate-baseline/index.ts:28-56`](../../supabase/functions/recalculate-baseline/index.ts)
```typescript
// Weighted mean
const weightedSum = dataPoints.reduce((sum, point) => sum + (point.value * point.weight), 0);
const mean = weightedSum / totalWeight;

// Weighted standard deviation  
const weightedVarianceSum = dataPoints.reduce((sum, point) => {
  return sum + (point.weight * Math.pow(point.value - mean, 2));
}, 0);
const sd = Math.sqrt(weightedVarianceSum / totalWeight);
```

### Context-Aware Windowing
- **Standard window**: 30-60 days adaptive to data density
- **Medication change detected**: Automatically shortens to 30 days to avoid contamination
- **Monthly recalibration**: Triggered every 30+ days or on medication changes

## Risk Scoring Algorithm

### Z-Score Calculation
**Formula:** `z = (x - μ) / σ`

Where:
- `x` = current daily value
- `μ` = personal baseline mean  
- `σ` = personal baseline standard deviation

### Risk Point Assignment
```typescript
// Risk points by deviation bands
if (Math.abs(zScore) >= 3) return 3;  // >3σ = 3 points
if (Math.abs(zScore) >= 2) return 2;  // >2σ = 2 points  
if (Math.abs(zScore) >= 1) return 1;  // >1σ = 1 point
return 0;                             // Normal range
```

### Weighted Aggregation
Risk points are aggregated across dimensions (sleep, mood, activity) with configurable weights to produce final risk level:
- **Green**: 0-2 total points (normal range)
- **Amber**: 3-5 total points (moderate deviation) 
- **Red**: 6+ total points (significant deviation)

## Multi-Model Orchestration

### Fallback Logic
**Implementation:** [`supabase/functions/guardian-chat/index.ts`](../../supabase/functions/guardian-chat/index.ts)

1. **Primary model attempt** with sanitized context
2. **Error detection** (rate limits, timeouts, model unavailable)
3. **Context preservation** during model switch
4. **Automatic fallback** to next available model
5. **User notification** with transparent handover message

### Context Assembly
Health data context automatically includes:
- Last 14 days of mood entries
- Current medications and schedules  
- Recent sleep and activity patterns
- Personal baseline comparisons
- Current risk state and contributing factors

All context is PII-sanitized before being sent to AI models.

## References

- **Technical Paper**: [Beyond Static Thresholds: Adaptive Digital Phenotyping](https://doi.org/10.5281/zenodo.16800716)
- **Source Code**: [GitHub Repository](https://github.com/bxrdy/bipolar-guardian)
- **EWMA Implementation**: `supabase/functions/recalculate-baseline/index.ts`
- **Risk Calculation**: Review actual implementation in risk calculation components