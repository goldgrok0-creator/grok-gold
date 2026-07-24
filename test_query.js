import { createClient } from '@supabase/supabase-js';

const url = "https://clsnuxoihrzuzdjisgbm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc251eG9paHJ6dXpkamlzZ2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODEyOTksImV4cCI6MjA5OTY1NzI5OX0.aExtivj1uaDyNX7TxmjL1PQ_QK-6ylxVypD4VkyUNtQ";

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
