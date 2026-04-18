import { createClient } from '@supabase/supabase-js';

const URL = 'https://rnmfkiskxwlnlubpkqgp.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubWZraXNreHdsbmx1YnBrcWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjkyMTAsImV4cCI6MjA4NjQ0NTIxMH0.dCF0MOSZWEAcctv9CS4qlkkgXyxn946juRvOsiVMAl8';

const supabase = createClient(URL, KEY);

async function getCount() {
  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Error fetching count:', error);
    process.exit(1);
  }
  
  console.log(`TOTAL_COUNT_RESULT:${count}`);
}

getCount();
