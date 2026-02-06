import { supabase } from '../../supabase/client.js';

async function test() {
  const { data, error } = await supabase.from('subscriptions').select('*').limit(1);

  if (error) {
    console.error('DB query failed:', error);
  } else {
    console.log('DB query result:', data);
  }
}

test();
