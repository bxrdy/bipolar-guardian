-- Create baseline_history table to track baseline changes over time
CREATE TABLE baseline_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    baseline_data JSONB NOT NULL, -- Store the full baseline_metrics record
    replaced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version_notes TEXT, -- Notes about why this baseline was replaced
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_baseline_history_user_id ON baseline_history(user_id);
CREATE INDEX idx_baseline_history_replaced_at ON baseline_history(replaced_at);

-- Add RLS policy
ALTER TABLE baseline_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own baseline history" ON baseline_history
    FOR SELECT USING (auth.uid() = user_id);

-- Add columns to baseline_metrics to track calculation method and metadata
ALTER TABLE baseline_metrics 
ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'initial_calculation',
ADD COLUMN IF NOT EXISTS window_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS medication_changes_detected BOOLEAN DEFAULT FALSE;

-- Create index on updated_at for efficient baseline update scheduling
CREATE INDEX IF NOT EXISTS idx_baseline_metrics_updated_at ON baseline_metrics(updated_at);

-- Add a function to automatically track baseline changes
CREATE OR REPLACE FUNCTION track_baseline_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if this is an update (not insert)
    IF TG_OP = 'UPDATE' THEN
        -- Check if any of the actual metric values changed
        IF (OLD.sleep_mean IS DISTINCT FROM NEW.sleep_mean OR
            OLD.sleep_sd IS DISTINCT FROM NEW.sleep_sd OR
            OLD.steps_mean IS DISTINCT FROM NEW.steps_mean OR
            OLD.steps_sd IS DISTINCT FROM NEW.steps_sd OR
            OLD.unlocks_mean IS DISTINCT FROM NEW.unlocks_mean OR
            OLD.unlocks_sd IS DISTINCT FROM NEW.unlocks_sd) THEN
            
            INSERT INTO baseline_history (user_id, baseline_data, version_notes)
            VALUES (
                OLD.user_id, 
                row_to_json(OLD)::JSONB,
                COALESCE(NEW.calculation_method, 'automatic_update')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track baseline changes
DROP TRIGGER IF EXISTS baseline_change_tracker ON baseline_metrics;
CREATE TRIGGER baseline_change_tracker
    BEFORE UPDATE ON baseline_metrics
    FOR EACH ROW
    EXECUTE FUNCTION track_baseline_changes();