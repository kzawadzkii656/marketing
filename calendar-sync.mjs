import {nextDay} from './parser.mjs';
import {exclusion} from './profile.mjs';
import {documentForDate,documentPeriod} from './documents.mjs';
import {warsawTime} from './calendar.mjs';
export function desiredEvents(state,options){
 const desired={};
 for(const doc of state.docs){
 const period=documentPeriod(doc);
 if(period){const versions=state.docs.filter(d=>{const p=documentPeriod(d);return p?.start===period.start&&p?.end===period.end});if(documentForDate(versions,period.start)?.id!==doc.id)continue}
 for(const task of doc.tasks){
  if(task.status!=='approved'||exclusion(task,state.profile))continue;
  const events=[];
  if(task.action!=='keep'&&task.start)events.push({day:task.start,action:task.action,key:task.id+':start'});
  if(task.action==='put'&&task.end)events.push({day:nextDay(task.end),action:'remove',key:task.id+':end'});
  for(const event of events){
   const selected=documentForDate(state.docs,event.day);
   if((selected&&selected.id!==doc.id)||doc.completed?.[event.key])continue;
   const start=warsawTime(event.day,event.action==='remove'?options.removeTime:options.putTime);
   const summary=({put:'Wywieś',remove:'Zdejmij',print:'Wydrukuj'}[event.action]||'Zadanie')+' — '+task.title;
   const location=task.source?.match(/Miejsce ekspozycji:\s*([^\n]+)/i)?.[1]||'';
   desired[doc.id+':'+event.key]={summary,description:[doc.name,task.page?'PDF, strona '+task.page:'Zadanie ręczne',task.indices?.length?'Indeksy: '+task.indices.join(', '):'',location?'Miejsce ekspozycji: '+location:'',task.notes,'Zarządzane przez Marketing sklepu. Odhacz zadanie w aplikacji, aby usunąć wydarzenie.'].filter(Boolean).join('\n'),start:{dateTime:start.toISOString(),timeZone:'Europe/Warsaw'},end:{dateTime:new Date(+start+600000).toISOString(),timeZone:'Europe/Warsaw'},reminders:{useDefault:false,overrides:options.alarm?[{method:'popup',minutes:0}]:[]},transparency:'transparent'};
  }
 }
 }
 return desired;
}
// Journal is persisted before network writes, making retries idempotent.
export async function reconcile(journal,desired,api,persist,newId){
 for(const key of Object.keys(journal))if(!desired[key]){
  try{await api('DELETE',journal[key].id)}catch(e){if(![404,410].includes(e.status))throw e}
  delete journal[key];await persist();
 }
 for(const [key,body] of Object.entries(desired)){
  const fingerprint=JSON.stringify(body);
  if(journal[key]?.fingerprint===fingerprint)continue;
  if(!journal[key]){journal[key]={id:newId(),fingerprint:null};await persist()}
  let entry=journal[key];
  for(let attempt=0;attempt<3;attempt++){
   try{
    if(entry.fingerprint)await api('PATCH',entry.id,body);
    else{
     try{await api('POST',entry.id,{...body,id:entry.id})}
     catch(e){if(e.status!==409)throw e;await api('PATCH',entry.id,body)}
    }
    entry.fingerprint=fingerprint;await persist();break;
   }catch(e){
    if(![404,410].includes(e.status)||attempt===2)throw e;
    // Deleted Google event IDs cannot be reused, including after undo.
    journal[key]=entry={id:newId(),fingerprint:null};await persist();
   }
  }
 }
}
