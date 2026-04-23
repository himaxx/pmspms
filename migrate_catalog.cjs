const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

const data = JSON.parse(fs.readFileSync('item names according to cat and sub cat.json', 'utf-8'));

async function main() {
  const { data: result, error } = await supabase
    .from('master_data')
    .upsert({ category: 'catalog', names: data.categories });
    
  if (error) {
    console.error('Error:', error);
    // write SQL query to run via MCP
    const sql = `INSERT INTO master_data (category, names) VALUES ('catalog', '${JSON.stringify(data.categories).replace(/'/g, "''")}') ON CONFLICT (category) DO UPDATE SET names = EXCLUDED.names;`;
    fs.writeFileSync('insert_catalog.sql', sql);
    console.log('SQL written to insert_catalog.sql');
  } else {
    console.log('Success:', result);
  }
}
main();
