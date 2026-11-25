// Paste your project values from Supabase > Project Settings > API
const SUPABASE_URL = "https://tlokyujizwmygwdujfkq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7jqsWclATHlAl9ROxLsckw_grGxr5Q-";
var sb = (window.supabase && !SUPABASE_URL.includes("YOUR-"))
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
