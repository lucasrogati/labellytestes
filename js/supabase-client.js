window.supabaseClient = null;
window.supabaseConfigurado = function(){
  const c = window.APP_CONFIG;
  return !!(c && c.SUPABASE_URL && c.SUPABASE_ANON_KEY && !c.SUPABASE_URL.includes("SEU-PROJETO") && !c.SUPABASE_ANON_KEY.includes("SUA_ANON"));
};
if (window.supabaseConfigurado() && window.supabase) {
  window.supabaseClient = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
}
