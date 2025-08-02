
-- Create a secure RPC function to truncate tables
CREATE OR REPLACE FUNCTION public.truncate_table(table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow truncating specific tables for safety
  IF table_name NOT IN ('sensor_samples', 'daily_summary', 'baseline_metrics', 'bug_reports', 'alert_settings') THEN
    RAISE EXCEPTION 'Table % is not allowed to be truncated', table_name;
  END IF;
  
  -- Execute the truncate command
  EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', table_name);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.truncate_table(TEXT) TO authenticated;
