const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://uhmjxaugneldzlqrlotj.supabase.co";
const supabaseKey = "sb_publishable_Avl7m8PP9g5ZGRJgcAUl_g_2iSoNZ2P";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  const { data, error } = await supabase.from("matches").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

testSupabase();