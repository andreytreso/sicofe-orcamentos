BEGIN;

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS group_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'suppliers_group_id_fkey'
  ) THEN
    ALTER TABLE public.suppliers
      ADD CONSTRAINT suppliers_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES public.company_groups(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.suppliers
  ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE public.suppliers
  DROP CONSTRAINT IF EXISTS suppliers_company_or_group;

ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_company_or_group
  CHECK (company_id IS NOT NULL OR group_id IS NOT NULL);

UPDATE public.suppliers s
SET group_id = c.group_id
FROM public.companies c
WHERE s.company_id = c.id
  AND s.group_id IS NULL;

COMMIT;
