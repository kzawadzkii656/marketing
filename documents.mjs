import {ranges} from './parser.mjs';
const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s));
export function documentPeriod(doc){
 const year=doc.name?.match(/20\d{2}/)?.[0];
 const named=year?ranges(doc.name,Number(year)):[];
 if(named.length===1)return named[0];
 const cycle=doc.cycle;
 return cycle&&valid(cycle.start)&&valid(cycle.end)&&cycle.start<=cycle.end?cycle:null;
}
export function documentForDate(docs,date){
 return docs.filter(d=>{const p=documentPeriod(d);return p&&p.start<=date&&date<=p.end})
  .sort((a,b)=>documentPeriod(b).start.localeCompare(documentPeriod(a).start)||String(b.created||'').localeCompare(String(a.created||''))||String(a.id).localeCompare(String(b.id)))[0]||null;
}
