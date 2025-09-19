const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mwjnevxctlxpunqpjmtd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13am5ldnhjdGx4cHVucXBqbXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzk5MjYsImV4cCI6MjA2NzgxNTkyNn0.FNh6XWtgG7h23fV0MebJtnF0ZVyCA8w5bReHxNtTiyE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    const { data, error } = await supabase
      .from('account_hierarchy')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    console.log('fetched count:', (data || []).length);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('unexpected error', err);
  }
})();
