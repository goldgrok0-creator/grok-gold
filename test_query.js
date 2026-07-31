import { createClient } from '@supabase/supabase-js';

const url = "https://qoqahhublvisnmvfaqvj.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcWFoaHVibHZpc25tdmZhcXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTc5NjcsImV4cCI6MjA5OTkzMzk2N30.wUXTs7X0-KaJoKFe6qF1bXYI_o13nDrijs4368tsAxQ";

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
