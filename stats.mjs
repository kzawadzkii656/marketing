// Public endpoint URL only. Never put a GitHub token in browser code.
export const STATS_ENDPOINT='';

export function normalizeStoreNumber(value){
 const number=String(value||'').trim().toUpperCase();
 return /^Z?[0-9]{3,8}$/.test(number)?(number.startsWith('Z')?number:`Z${number}`):'';
}

export async function sendUsage(number,endpoint=STATS_ENDPOINT){
 if(!endpoint)return {ok:false,reason:'unconfigured'};
 const response=await fetch(endpoint,{
  method:'POST',mode:'cors',cache:'no-store',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({storeNumber:number})
 });
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 const body=await response.json();
 if(!body.ok||!/^\d{4}-\d{2}-\d{2}$/.test(body.day))throw Error('Nieprawidłowa odpowiedź serwera.');
 return body;
}
