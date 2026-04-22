import { supabase } from "./src/utils/supabase.js";
async function run() {
  const { data, error } = await supabase.from("jobs").select("job_no, s2_actual, s2_yes_no, s2_inhouse").order("job_no", { ascending: false }).limit(10);
  if (error) console.error("Error:", error);
  else console.log(JSON.stringify(data, null, 2));
}
run();
