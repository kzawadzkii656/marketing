import {GOOGLE_CLIENT_ID} from './google-config.mjs';
export const LOGIN_KEY='marketing-google-login-v13';
const CALENDAR_SCOPE='https://www.googleapis.com/auth/calendar.app.created';
const MAX_AGE=30*24*60*60*1000;
export let loginToken=null;
export let loginIdentity=null;
let scriptPromise;
export function rememberedIdentity(storage=localStorage,now=Date.now()){
 try{const identity=JSON.parse(storage.getItem(LOGIN_KEY));
 if(identity&&typeof identity.sub==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(identity.sub)&&typeof identity.email==='string'&&(!identity.guest||identity.sub==='local-guest')&&Number.isFinite(identity.verifiedAt)&&identity.verifiedAt<=now&&now-identity.verifiedAt<MAX_AGE)return identity;
 }catch{}return null;
}
export function accountDatabase(identity){if(!identity||!/^[a-zA-Z0-9_-]{1,128}$/.test(identity.sub))throw Error('Brak zalogowanego konta.');return identity.guest?'marketing-sklepu':'marketing-sklepu-google-'+identity.sub}
export async function loadGoogle(){
 if(globalThis.google?.accounts?.oauth2)return;
 if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;const timer=setTimeout(()=>{s.remove();reject(Error('Nie udało się wczytać Google. Sprawdź internet i spróbuj ponownie.'))},15000);s.onload=()=>{clearTimeout(timer);resolve()};s.onerror=()=>{clearTimeout(timer);s.remove();reject(Error('Nie udało się wczytać Google.'))};document.head.append(s)}).catch(e=>{scriptPromise=null;throw e});
 return scriptPromise;
}
export async function identifyGoogle(accessToken){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+accessToken},cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Nie udało się potwierdzić konta Google.');const identity=await response.json();if(!/^[a-zA-Z0-9_-]{1,128}$/.test(identity.sub||''))throw Error('Nieprawidłowa odpowiedź Google.');return {sub:identity.sub,email:String(identity.email||'Konto Google'),verifiedAt:Date.now()};}finally{clearTimeout(timer)}
}
export function signOut(){localStorage.removeItem(LOGIN_KEY);loginToken=null;location.reload()}
export function remember(identity){try{localStorage.setItem(LOGIN_KEY,JSON.stringify(identity))}catch{/* The current page session still works when persistent storage is unavailable. */}}
export async function requireLogin(){
 const remembered=rememberedIdentity();
 if(remembered){loginIdentity=remembered;watchAccount();return remembered}
 document.querySelector('nav').hidden=true;
 const app=document.querySelector('#app');
 app.innerHTML='<section class="card login-card"><h1>Marketing sklepu</h1><p>Korzystaj lokalnie lub połącz konto Google, aby synchronizować zadania z kalendarzem.</p><button id="login-local" class="primary wide">Korzystaj bez logowania</button><button id="login-google" class="wide" disabled>Zaloguj przez Google</button><button id="login-retry" class="wide" hidden>Spróbuj ponownie</button><p id="login-status" role="status"></p><p class="hint">Logowanie i zgoda na kalendarz odbywają się w Google. Materiały PDF i postęp pozostają na tym telefonie, osobno dla każdego konta. Do kalendarza wysyłamy tytuły, terminy i opisy zaakceptowanych zadań.</p><p class="hint">Logowanie jest dobrowolne. Wszystkie funkcje planu i importu działają bez konta. Wybór trybu lub konto zapamiętamy na tym telefonie na 30 dni. Dostęp do kalendarza może wymagać ponownego połączenia. Bez abonamentu, statystyk i numerów sklepów.</p></section>';
 const button=document.querySelector('#login-google'),status=document.querySelector('#login-status'),retry=document.querySelector('#login-retry');
 async function prepare(){retry.hidden=true;if(!GOOGLE_CLIENT_ID){status.textContent='Logowanie nie jest jeszcze skonfigurowane przez właściciela aplikacji.';return}if(!navigator.onLine){status.textContent='Pierwsze logowanie wymaga internetu.';retry.hidden=false;return}try{status.textContent='Przygotowywanie logowania…';await loadGoogle();button.disabled=false;status.textContent='Możesz zalogować się przez Google.'}catch(e){status.textContent=e.message;retry.hidden=false}}
 retry.onclick=prepare;button.disabled=!GOOGLE_CLIENT_ID;status.textContent=GOOGLE_CLIENT_ID?'Konto Google jest potrzebne tylko do kalendarza.':'Tryb lokalny jest gotowy. Połączenie Google nie jest jeszcze skonfigurowane.';
 return new Promise(resolve=>{
 document.querySelector('#login-local').onclick=()=>{loginIdentity={sub:'local-guest',email:'',guest:true,verifiedAt:Date.now()};remember(loginIdentity);watchAccount();document.querySelector('nav').hidden=false;resolve(loginIdentity)};
 button.onclick=()=>{
  if(!globalThis.google?.accounts?.oauth2){button.disabled=true;void prepare();return}
  document.querySelector('#login-local').disabled=true;
  button.disabled=true;status.textContent='Dokończ logowanie w oknie Google.';
  const fail=message=>{loginToken=null;status.textContent=message;button.disabled=false;document.querySelector('#login-local').disabled=false};
  const client=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:'openid email '+CALENDAR_SCOPE,include_granted_scopes:false,error_callback:()=>fail('Okno Google zamknięto lub zostało zablokowane. Spróbuj ponownie w Safari albo Chrome.'),callback:async response=>{
   if(response.error||!response.access_token||!google.accounts.oauth2.hasGrantedAllScopes(response,'openid',CALENDAR_SCOPE)){fail('Aby włączyć tę wersję aplikacji, zaakceptuj logowanie i dostęp do kalendarza utworzonego przez aplikację.');return}
   try{
    const identity=await identifyGoogle(response.access_token);loginIdentity=identity;
    loginToken={accessToken:response.access_token,expires:Date.now()+Math.max(0,Number(response.expires_in)-60)*1000};
    remember(identity);watchAccount();document.querySelector('nav').hidden=false;resolve(identity);
   }catch(e){fail(e.name==='AbortError'?'Google nie odpowiedziało. Spróbuj ponownie.':e.message)}
  }});
  try{client.requestAccessToken({prompt:'select_account'})}catch{fail('Nie udało się otworzyć logowania Google.')}
 };
 });
}
function watchAccount(){window.addEventListener('storage',event=>{if(event.key===LOGIN_KEY&&rememberedIdentity()?.sub!==loginIdentity?.sub)location.reload()})}
