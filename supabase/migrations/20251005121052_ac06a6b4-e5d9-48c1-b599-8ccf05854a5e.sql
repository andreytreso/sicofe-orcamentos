-- Add cost center support to approval_items table
-- This allows approvers to see which cost centers are associated with each approval item

-- Add fields to store cost center information
ALTER TABLE public.approval_items
ADD COLUMN IF NOT EXISTS all_cost_centers boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS cost_center_names text;

COMMENT ON COLUMN public.approval_items.all_cost_centers IS 'Whether the transaction applies to all cost centers';
COMMENT ON COLUMN public.approval_items.cost_center_names IS 'Comma-separated list of cost center names for display';

-- Update the trigger to include cost center information
CREATE OR REPLACE FUNCTION public.create_approval_item_from_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  requester_name text;
  transaction_period text;
  cost_center_list text;
BEGIN
  -- Get requester name from profiles
  SELECT COALESCE(first_name || ' ' || last_name, 'Unknown User')
  INTO requester_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Format period as YYYY-MM
  transaction_period := TO_CHAR(NEW.transaction_date, 'YYYY-MM');

  -- Get cost center names if not all cost centers
  IF NOT NEW.all_cost_centers THEN
    SELECT string_agg(cc.name, ', ')
    INTO cost_center_list
    FROM transaction_cost_centers tcc
    JOIN cost_centers cc ON cc.id = tcc.cost_center_id
    WHERE tcc.transaction_id = NEW.id;
  END IF;

  -- Insert approval item with observations and cost center info
  INSERT INTO approval_items (
    company_id,
    user_id,
    transaction_date,
    period,
    level_1_group,
    level_2_group,
    analytical_account,
    amount,
    requester,
    observations,
    status,
    approval_level,
    all_cost_centers,
    cost_center_names
  ) VALUES (
    NEW.company_id,
    NEW.user_id,
    NEW.transaction_date,
    transaction_period,
    NEW.level_1_group,
    NEW.level_2_group,
    NEW.analytical_account,
    NEW.amount,
    requester_name,
    NEW.observations,
    'PENDING',
    3,
    NEW.all_cost_centers,
    cost_center_list
  );

  RETURN NEW;
END;
$function$;