-- Activer le realtime sur les notifications (cloche admin / propriétaire)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'notifications'
  ) THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
      WHEN duplicate_object THEN
        NULL; -- déjà dans la publication
      WHEN others THEN
        RAISE NOTICE 'realtime notifications: %', SQLERRM;
    END;
  END IF;
END $$;
