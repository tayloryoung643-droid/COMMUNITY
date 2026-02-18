-- Fix: Remove SECURITY DEFINER from faq_items_resident_view
-- Flagged by Supabase security advisor. SECURITY DEFINER makes the view
-- run with the creator's permissions, bypassing the querying user's RLS.
-- Recreate as SECURITY INVOKER (the default) so RLS applies normally.

DROP VIEW IF EXISTS public.faq_items_resident_view;

CREATE VIEW public.faq_items_resident_view
  WITH (security_invoker = true)
AS
  SELECT id, building_id, category, question, answer, display_order, view_count
  FROM public.faq_items
  WHERE is_visible = true;
