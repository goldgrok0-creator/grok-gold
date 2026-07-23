import { createClient } from '@supabase/supabase-js';

const url = "https://qfhwprovgkjuiyiguxtn.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHdwcm92Z2tqdWl5aWd1eHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc0NTUsImV4cCI6MjA5OTc5MzQ1NX0.r2MkVzBez8D0Hgi5CMzNSUPHRMSDNq6To0AYTfioGYA";

const supabase = createClient(url, key);

async function run() {
  console.log('--- USERS ---');
  const { data: users, error: uErr } = await supabase.from('users').select('*');
  console.log(uErr || users);

  console.log('--- DEPOSITS ---');
  const { data: deposits, error: dErr } = await supabase.from('deposits').select('*');
  console.log(dErr || deposits);
}

run();

