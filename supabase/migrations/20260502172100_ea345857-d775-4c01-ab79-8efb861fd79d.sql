CREATE OR REPLACE FUNCTION public.public_submit_rating(
  query_text text,
  rating_value integer,
  comment_text text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.maintenance_requests%ROWTYPE;
  v_allowed_stages text[] := ARRAY['completed','billed','paid','handover_to_admin','closed'];
BEGIN
  IF rating_value IS NULL OR rating_value < 1 OR rating_value > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_rating');
  END IF;

  -- ابحث عن الطلب بـ id (UUID) أو request_number
  SELECT * INTO v_request
  FROM public.maintenance_requests
  WHERE id::text = query_text
     OR request_number = query_text
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'request_not_found');
  END IF;

  IF v_request.workflow_stage::text <> ALL(v_allowed_stages) THEN
    RETURN jsonb_build_object('success', false, 'error', 'request_not_completed');
  END IF;

  IF v_request.rating IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_rated');
  END IF;

  UPDATE public.maintenance_requests
  SET rating = rating_value,
      feedback_comment = NULLIF(trim(coalesce(comment_text,'')), ''),
      rated_at = now()
  WHERE id = v_request.id;

  RETURN jsonb_build_object('success', true, 'rating', rating_value);
END;
$$;

REVOKE ALL ON FUNCTION public.public_submit_rating(text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_submit_rating(text, integer, text) TO anon, authenticated;