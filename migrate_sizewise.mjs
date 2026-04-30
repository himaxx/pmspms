import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://rnmfkiskxwlnlubpkqgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubWZraXNreHdsbmx1YnBrcWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjkyMTAsImV4cCI6MjA4NjQ0NTIxMH0.dCF0MOSZWEAcctv9CS4qlkkgXyxn946juRvOsiVMAl8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const jsonPath = path.resolve('src/data/sizewise_details.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('Starting migration to sizewise_details table...');

  for (const [category, designs] of Object.entries(data)) {
    console.log(`Processing category: ${category} (${designs.length} designs)`);
    
    for (const design of designs) {
      const { error } = await supabase
        .from('sizewise_details')
        .upsert({
          category: category,
          design_name: design.name,
          pieces: design.pieces,
          sizes: design.sizes
        }, { onConflict: 'category, design_name' });

      if (error) {
        console.error(`Error upserting ${design.name}:`, error);
      } else {
        process.stdout.write('.');
      }
    }
    console.log('\n');
  }

  console.log('Migration complete!');
}

migrate();
