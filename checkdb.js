import { supabase } from ./src/utils/supabase.js; async function run() { const {data} = await supabase.from(jobs).select(*).order(job_no, {ascending: false}).limit(1); console.log(data); } run();
