import {loginIdentity,loginToken,remember,signOut} from './auth.mjs';
import {GOOGLE_CLIENT_ID} from './google-config.mjs';
import {desiredEvents,reconcile} from './calendar-sync.mjs';
const SCOPE='https://www.googleapis.com/auth/calendar.app.created';
let scriptPromise;
export class GoogleCalendar{
 constructor({get,put,getState,onStatus}){Object.assign(this,{get,put,getState,onStatus});this.data={enabled:false,putTime:'05:45',removeTime:'23:05',alarm:true,accounts:{}};this.status='Kalendarz nie jest połączony.';this.token='';this.expires=0;this.account=null;this.working=false;this.again=false;}
 get accountKey(){return GOOGLE_CLIENT_ID+':'+loginIdentity.sub}
 get enabled(){return this.data.enabled}
 get authorized(){return !!this.token&&Date.now()<this.expires}
 statusText(text){this.status=text;this.onStatus?.()}
 async load(){const data=await this.get('google-calendar');if(data)this.data={...this.data,...data};if(loginIdentity.guest){this.data.enabled=false;this.status='Tryb lokalny. Zaloguj się przez Google, jeśli chcesz korzystać z kalendarza.';return}if(loginToken&&Date.now()<loginToken.expires){this.token=loginToken.accessToken;this.expires=loginToken.expires;this.account=this.accountKey;this.data.enabled=true;await this.persist();this.schedule()}if(this.enabled)this.status='Kalendarz: połącz z Google w zakładce Sklep, aby wysłać zmiany.';window.addEventListener('online',()=>this.schedule());document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.schedule()})}
 persist(){return this.put('google-calendar',this.data)}
 async prepare(){
  if(loginIdentity.guest)return false;
  if(!GOOGLE_CLIENT_ID){this.statusText('Właściciel aplikacji musi najpierw skonfigurować połączenie Google.');return false}
  if(globalThis.google?.accounts?.oauth2)return true;
  if(!navigator.onLine)return false;
  if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;const timer=setTimeout(()=>{s.remove();reject(Error('Nie udało się wczytać Google. Sprawdź internet.'))},15000);s.onload=()=>{clearTimeout(timer);resolve()};s.onerror=()=>{clearTimeout(timer);s.remove();reject(Error('Nie udało się wczytać Google.'))};document.head.append(s)}).catch(e=>{scriptPromise=null;throw e});
  await scriptPromise;return true;
 }
 async connect(){
  if(loginIdentity.guest){signOut();return}
  if(this.working)return;
  if(!navigator.onLine){this.statusText('Brak internetu. Odhaczenia są zapisane lokalnie.');return}
  if(this.authorized){this.data.enabled=true;await this.persist();return this.sync()}
  if(!globalThis.google?.accounts?.oauth2){try{if(await this.prepare())this.statusText('Google jest gotowe. Kliknij ponownie „Połącz z Google”.')}catch(e){this.statusText(e.message)}return}
  this.working=true;this.statusText('Czekam na zgodę w oknie Google…');
  const fail=()=>{this.working=false;this.statusText('Nie połączono z Google. Możesz spróbować ponownie.')};
  const client=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:'openid '+SCOPE,include_granted_scopes:false,error_callback:fail,callback:async response=>{
   if(response.error||!google.accounts.oauth2.hasGrantedAllScopes(response,'openid',SCOPE)){fail();return}
   this.token=response.access_token;this.expires=Date.now()+Math.max(0,Number(response.expires_in)-60)*1000;
   try{
    const identity=await this.request('https://openidconnect.googleapis.com/v1/userinfo');
    if(!identity.sub)throw Error('Nie udało się rozpoznać konta Google.');
    if(identity.sub!==loginIdentity.sub)throw Error('Wybrano inne konto Google. Najpierw wyloguj się z aplikacji i wybierz to konto.');
    remember({...loginIdentity,verifiedAt:Date.now()});this.account=this.accountKey;this.data.enabled=true;await this.persist();
    this.working=false;await this.sync();
   }catch(e){this.token='';this.working=false;this.statusText('Połączenie nieudane: '+e.message)}
  }});
  try{client.requestAccessToken({prompt:'select_account'})}catch(e){fail()}
 }
 pause(){if(this.working)return;this.data.enabled=false;this.token='';this.expires=0;clearTimeout(this.timer);this.persist().catch(()=>this.statusText('Nie udało się zapisać ustawienia.'));this.statusText('Synchronizacja wstrzymana. Istniejące wydarzenia pozostają w Google.')}
 schedule(){if(!this.enabled)return;this.again=true;clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),500)}
 async request(url,method='GET',body){
  if(!this.authorized){const e=Error('Kliknij „Połącz z Google”, aby wznowić synchronizację.');e.status=401;throw e}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch(url,{method,headers:{Authorization:'Bearer '+this.token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store'});
   if(!response.ok){if(response.status===401){this.token='';this.expires=0}const e=Error(response.status===401?'Połącz ponownie z Google.':response.status===403?'Brak uprawnień Google, niewłączone API lub przekroczony limit.':response.status===429?'Limit Google. Spróbuj ponownie później.':'Google zwróciło błąd '+response.status);e.status=response.status;throw e}
   return response.status===204?null:response.json();
  }finally{clearTimeout(timer)}
 }
 async sync(){
  if(!this.enabled)return;
  if(this.working){this.again=true;return}
  if(!navigator.onLine){this.statusText('Kalendarz: zmiany czekają na internet i połączenie Google.');return}
  if(!this.authorized||!this.account){this.statusText('Kalendarz: połącz z Google w zakładce Sklep, aby wysłać zmiany.');return}
  if(!navigator.locks){this.statusText('Ta przeglądarka nie obsługuje bezpiecznej synchronizacji. Zaktualizuj Safari lub Chrome.');return}
  this.working=true;this.statusText('Synchronizacja kalendarza…');let success=false;
  try{
   await navigator.locks.request('marketing-google-sync',async()=>{
    // Reload shared journal under a lock to avoid duplicates from multiple tabs.
    const current=await this.get('google-calendar');if(current)this.data=current;
    if(!this.enabled)return;
    let account=this.data.accounts[this.account];
    if(!account){account={calendarId:null,events:{}};this.data.accounts[this.account]=account}
    if(!account.calendarId&&!Object.keys(desiredEvents(await this.get('state')||this.getState(),this.data)).length){this.again=false;this.statusText('Google połączone. Zaimportuj i zaakceptuj zadania do synchronizacji.');success=true;return}
    if(!account.calendarId){const calendar=await this.request('https://www.googleapis.com/calendar/v3/calendars','POST',{summary:'Marketing sklepu',description:'Zadania z aplikacji Marketing sklepu na tym urządzeniu.',timeZone:'Europe/Warsaw'});account.calendarId=calendar.id;await this.persist()}
    const base='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(account.calendarId)+'/events';
    // A missing calendar is not the same as a missing event: stop, never drop journal.
    await this.request('https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(account.calendarId));
    do{
     this.again=false;
     const snapshot=await this.get('state')||this.getState();
     const desired=desiredEvents(snapshot,this.data);
     await reconcile(account.events,desired,(method,id,body)=>this.request(base+(method==='POST'?'':'/'+encodeURIComponent(id)),method,body),()=>this.persist(),()=>crypto.randomUUID().replace(/-/g,''));
    }while(this.again&&this.enabled&&this.authorized);
    this.statusText('Kalendarz zsynchronizowany • '+new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'}));success=true;
   });
  }catch(e){this.statusText('Kalendarz: '+(e.name==='AbortError'?'Brak odpowiedzi Google. Zmiany czekają na ponowienie.':e.message)+' Zadania są zapisane na telefonie.');}
  finally{this.working=false;this.onStatus?.();if(success&&this.again)this.schedule()}
 }
}
