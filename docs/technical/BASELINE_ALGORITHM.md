# Personal Baseline Calculation Algorithm

## How Personal Baselines Work

Everyone's "normal" is different. Our baseline system learns your unique patterns using statistical analysis to understand when something is off, providing the foundation for personalized insights.

There are two stages to this process:
1.  **Initial Baseline Calculation**: A simple calculation to get you started.
2.  **Dynamic Recalculation**: A more sophisticated, weighted algorithm that evolves with you over time.

---

## Initial Baseline Calculation

To get started, the system first needs to establish your initial baseline.

-   **Data Requirement**: Requires at least **7 days** of data for a given metric (e.g., sleep hours).
-   **Method**: A standard **mean (average)** and **standard deviation** are calculated from this initial data set.
-   **Your "Normal" Range**: This is defined as your initial mean +/- one standard deviation.

---

## Dynamic Baseline Recalculation

Once your initial baseline is set, a more advanced system takes over to ensure your baseline evolves as your habits do.

### Weighted Rolling Window Algorithm
This system uses a **weighted rolling window algorithm** where more recent data has a greater influence. The weight of each data point is calculated using exponential decay, meaning older data has less impact on your current baseline.

-   **Formula**: `weight = e^(-days_ago * ln(2) / half_life)`
-   **Half-life**: 15 days (the influence of a data point is halved every 15 days).
-   **Window Size**: An adaptive **30-60 day** window is used for calculations.
-   **Medication Change Detection**: If the system detects a recent medication change, it automatically shortens the window to **30 days**. This ensures your new baseline isn't contaminated by old patterns from before the change.

### Recalculation Triggers
Your baseline is automatically recalculated when:
1.  **Monthly**: At least 30 days have passed since the last update.
2.  **Manually**: You request a recalculation from the Health Data screen.
3.  **Medication Changes**: The system detects a change in your prescriptions.

---

## Risk Analysis & Scoring

The system analyzes your daily data against your current baseline to generate a risk score.

-   **Z-Score Calculation**: For each metric, the system calculates a Z-score, which measures how many standard deviations away from your baseline mean a data point is. `Z-Score = |(current_value - baseline_mean) / baseline_sd|`
-   **Risk Point System**:
    -   If Z-Score > 1 (more than 1 standard deviation away): **+1 risk point**
    -   If Z-Score > 2 (more than 2 standard deviations away): **+2 risk points**
-   **Final Risk Level**: The points are summed up, and a final color-coded risk level is assigned:
    -   **Green**: 0-1 points
    -   **Amber**: 2-3 points
    -   **Red**: 4+ points

This detailed, code-aligned process ensures that the risk analysis is both personalized and statistically sound.
