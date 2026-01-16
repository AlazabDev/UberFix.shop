-- إضافة سياسات RLS للجداول التي لا تحتوي على سياسات
-- جدول media_files
CREATE POLICY "Authenticated users can read media files"
  ON public.media_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages media files"
  ON public.media_files
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- جدول media_processing_errors
CREATE POLICY "Authenticated users can read media errors"
  ON public.media_processing_errors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages media errors"
  ON public.media_processing_errors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- جدول whatsapp_media_storage
CREATE POLICY "Authenticated users can read whatsapp media"
  ON public.whatsapp_media_storage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages whatsapp media"
  ON public.whatsapp_media_storage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- جدول media_stats_daily
CREATE POLICY "Authenticated users can read media stats"
  ON public.media_stats_daily
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages media stats"
  ON public.media_stats_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);