-- Fix Function Search Path Mutable warning (security hardening)
CREATE OR REPLACE FUNCTION public.update_media_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- تحديث الإحصائيات اليومية
  INSERT INTO media_stats_daily (date, total_files, inbound_count, outbound_count, total_size, by_type)
  VALUES (
    DATE(NEW.processed_at),
    1,
    CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END,
    CASE WHEN NEW.direction = 'outbound' THEN 1 ELSE 0 END,
    COALESCE(NEW.file_size, 0),
    jsonb_build_object(NEW.file_type, 1)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_files = media_stats_daily.total_files + 1,
    inbound_count = media_stats_daily.inbound_count + 
      CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END,
    outbound_count = media_stats_daily.outbound_count + 
      CASE WHEN NEW.direction = 'outbound' THEN 1 ELSE 0 END,
    total_size = media_stats_daily.total_size + COALESCE(NEW.file_size, 0),
    by_type = jsonb_set(
      COALESCE(media_stats_daily.by_type, '{}'::jsonb),
      ARRAY[NEW.file_type],
      to_jsonb(
        COALESCE((media_stats_daily.by_type->>NEW.file_type)::INT, 0) + 1
      )
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;
