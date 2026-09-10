(function(){
 const msg=document.getElementById('loginMsg');
 const configured=()=>window.supabaseClient;
 async function adminGuard(){
  if(!configured()){ if(msg) msg.textContent='Painel ainda não configurado. Consulte o README.'; return null; }
  const {data:{user}}=await supabaseClient.auth.getUser();
  if(!user){ location.replace('login.html'); return null; }
  const {data:profile}=await supabaseClient.from('profiles').select('role').eq('id',user.id).single();
  if(!profile || profile.role!=='admin'){ await supabaseClient.auth.signOut(); location.replace('login.html?erro=sem-permissao'); return null; }
  return user;
 }
 window.adminGuard=adminGuard;
 document.getElementById('toggleSenha')?.addEventListener('click',()=>{const i=document.getElementById('senha');i.type=i.type==='password'?'text':'password'});
 document.getElementById('loginForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!configured()){msg.textContent='Configure js/app-config.js primeiro.';return} msg.textContent='Entrando…'; const {error}=await supabaseClient.auth.signInWithPassword({email:email.value.trim(),password:senha.value}); if(error){msg.textContent='E-mail ou senha inválidos.';return} location.replace('index.html')});
 document.getElementById('logoutBtn')?.addEventListener('click',async()=>{await supabaseClient.auth.signOut();location.replace('login.html')});
})();