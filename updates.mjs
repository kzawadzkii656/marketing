export async function setupUpdates({isBusy=()=>false,onReady=()=>{},onError=()=>{}}={}){
 if(!('serviceWorker' in navigator))return null;
 let registration,waiting=null,applying=false,changed=false,reloaded=false,deferred=false,shown=null,timer;
 const dialog=document.createElement('dialog');dialog.id='update-dialog';dialog.setAttribute('aria-labelledby','update-title');
 dialog.innerHTML='<div class="update-dialog-content"><span class="update-dialog-icon" aria-hidden="true">↻</span><h2 id="update-title">Dostępna jest nowa wersja</h2><p>Aktualizacja jest pobrana i gotowa do uruchomienia. PDF-y, ustawienia i zapisane odhaczenia pozostaną na telefonie.</p><p id="update-status" role="status" aria-live="polite"></p><div class="update-dialog-actions"><button id="update-apply" class="primary">Aktualizuj teraz</button><button id="update-later">Później</button></div></div>';
 const banner=document.createElement('button');banner.id='update-banner';banner.className='update-banner';banner.hidden=true;banner.textContent='Nowa wersja jest gotowa — aktualizuj';
 document.body.append(dialog);document.querySelector('header').after(banner);
 const apply=dialog.querySelector('#update-apply'),later=dialog.querySelector('#update-later'),status=dialog.querySelector('#update-status');
 const dirty=()=>!!document.querySelector('form[data-update-dirty]');
 document.addEventListener('input',event=>{const form=event.target.closest?.('form');if(form)form.dataset.updateDirty='true'});
 function reloadWhenSafe(){if(reloaded)return;if(isBusy()||dirty()){status.textContent='Czekam na zakończenie zapisywania danych.';clearTimeout(timer);timer=setTimeout(reloadWhenSafe,500);return}reloaded=true;location.reload()}
 function show(){
  if(!waiting&&!changed)return;
  banner.hidden=false;
  if(isBusy()||document.querySelector('dialog[open]:not(#update-dialog)')){clearTimeout(timer);timer=setTimeout(()=>{if(!deferred)show()},1000);return}
  if(!dialog.open){dialog.showModal();later.focus()}
  status.textContent=dirty()?'Masz niezapisane zmiany w formularzu. Wybierz „Później” i zapisz je przed aktualizacją.':'';
 }
 function postpone(){deferred=true;dialog.close();banner.hidden=false}
 later.onclick=postpone;
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!applying)postpone()});
 banner.onclick=()=>{deferred=false;show()};
 function offer(worker){if(!worker)return;waiting=worker;banner.hidden=false;if(shown!==worker){shown=worker;deferred=false;show()}}
 apply.onclick=()=>{
  if(isBusy()||dirty()){status.textContent='Najpierw zapisz zmiany lub poczekaj na zakończenie importu i synchronizacji. Wybierz „Później”.';return}
  applying=true;apply.disabled=true;later.disabled=true;status.textContent='Uruchamiam nową wersję…';
  if(changed){reloadWhenSafe();return}
  waiting=registration.waiting||waiting;
  if(!waiting||waiting.state==='redundant'){applying=false;apply.disabled=false;later.disabled=false;status.textContent='Aktualizacja nie jest już dostępna. Sprawdź ponownie w zakładce Sklep.';return}
  waiting.postMessage({type:'ACTIVATE_UPDATE'});
  clearTimeout(timer);timer=setTimeout(()=>{if(!reloaded){applying=false;apply.disabled=false;later.disabled=false;status.textContent='Nie udało się jeszcze uruchomić aktualizacji. Spróbuj ponownie.'}},15000);
 };
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(!navigator.serviceWorker.controller)return;
  // Initial installation requires no reload or update dialog.
  if(!hadController&&!applying){hadController=true;return}
  changed=true;clearTimeout(timer);
  if(applying)reloadWhenSafe();else{waiting=null;deferred=false;show()}
 });
 let hadController=!!navigator.serviceWorker.controller;
 try{
  registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
  function watch(worker){if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offer(registration.waiting||worker);if(worker.state==='redundant')onError('Nie udało się pobrać aktualizacji. Obecna wersja nadal działa.')})}
  registration.addEventListener('updatefound',()=>watch(registration.installing));watch(registration.installing);
  if(registration.waiting)offer(registration.waiting);
  navigator.serviceWorker.ready.then(onReady).catch(()=>{});
 }catch{onError('Nie udało się przygotować trybu offline i aktualizacji.');return null}
 let lastCheck=0,checking=false;
 async function check(manual=false){
  if(checking)return;
  if(!navigator.onLine){if(manual)onError('Sprawdzanie aktualizacji wymaga internetu.');return}
  if(!manual&&Date.now()-lastCheck<60000)return;
  checking=true;lastCheck=Date.now();
  try{await registration.update();if(registration.waiting){deferred=false;offer(registration.waiting);show()}else if(manual)onError(registration.installing?'Pobieram nową wersję. Okienko pojawi się, gdy będzie gotowa.':'Nie znaleziono nowej aktualizacji.')}
  catch{if(manual)onError('Nie udało się sprawdzić aktualizacji. Spróbuj ponownie później.')}
  finally{checking=false}
 }
 window.addEventListener('online',()=>check());document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
 window.addEventListener('marketing-check-update',()=>check(true));void check();
 return {check};
}
