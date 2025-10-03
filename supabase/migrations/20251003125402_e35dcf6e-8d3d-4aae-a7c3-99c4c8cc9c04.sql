-- Add observations field to approval_items table
ALTER TABLE approval_items ADD COLUMN observations text;

-- Update the trigger function to copy observations from transactions
CREATE OR REPLACE FUNCTION create_approval_item_from_transaction()
RETURNS TRIGGER AS $$
DECLARE
  requester_name text;
  transaction_period text;
BEGIN
  -- Get requester name from profiles
  SELECT COALESCE(first_name || ' ' || last_name, 'Unknown User')
  INTO requester_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Format period as YYYY-MM
  transaction_period := TO_CHAR(NEW.transaction_date, 'YYYY-MM');

  -- Insert approval item with observations
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
    approval_level
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
    3
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;