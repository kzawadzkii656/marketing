export function warsawTime(day,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Niepoprawna data lub godzina.');
 const target=Date.parse(day+'T'+time+':00Z');if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,10)!==day)throw Error('Niepoprawna data.');let value=target;
 const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){const p=Object.fromEntries(fmt.formatToParts(new Date(value)).map(x=>[x.type,x.value]));const local=Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);if(local===target)return new Date(value);value+=target-local;}
 throw Error('Ta godzina nie istnieje przy zmianie czasu. Wybierz inną.');
}
