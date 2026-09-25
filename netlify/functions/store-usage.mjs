const origin='https://kzawadzkii656.github.io';
const headers={
 'Access-Control-Allow-Origin':origin,
 'Access-Control-Allow-Methods':'POST, OPTIONS',
 'Access-Control-Allow-Headers':'Content-Type',
 'Cache-Control':'no-store',
 'Vary':'Origin'
};
const json=(status,value)=>new Response(JSON.stringify(value),{status,headers:{...headers,'Content-Type':'application/json'}});

export default async function handler(request){
 if(request.headers.get('Origin')!==origin)return json(403,{ok:false});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='POST')return json(405,{ok:false});
 if(Number(request.headers.get('content-length')||0)>1024)return json(413,{ok:false});
 const token=process.env.GITHUB_STATS_TOKEN,repo=process.env.GITHUB_STATS_REPO;
 if(!token||!/^[\w.-]+\/[\w.-]+$/.test(repo||''))return json(503,{ok:false});
 let body;
 try{const raw=await request.text();if(raw.length>1024)return json(413,{ok:false});body=JSON.parse(raw)}catch{return json(400,{ok:false})}
 const rawNumber=String(body?.storeNumber||'').trim().toUpperCase();
 if(!/^Z?[0-9]{3,8}$/.test(rawNumber))return json(400,{ok:false});
 const storeNumber=rawNumber.startsWith('Z')?rawNumber:`Z${rawNumber}`;
 const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const path=`activity/${day}/${storeNumber}.json`;
 const url=`https://api.github.com/repos/${repo}/contents/${path}`;
 const githubHeaders={
  Accept:'application/vnd.github+json',
  Authorization:`Bearer ${token}`,
  'X-GitHub-Api-Version':'2022-11-28'
 };
 try{
  const existing=await fetch(url,{headers:githubHeaders});
  if(existing.ok)return json(200,{ok:true,day});
  if(existing.status!==404)return json(502,{ok:false});
  const content=Buffer.from(JSON.stringify({storeNumber,day,recordedAt:new Date().toISOString()})+'\n').toString('base64');
  const saved=await fetch(url,{
   method:'PUT',headers:{...githubHeaders,'Content-Type':'application/json'},
   body:JSON.stringify({message:`Aktywność sklepu ${storeNumber} • ${day}`,content})
  });
  if(saved.status===201||saved.status===200)return json(201,{ok:true,day});
  if(saved.status===409||saved.status===422){
   const raced=await fetch(url,{headers:githubHeaders});
   if(raced.ok)return json(200,{ok:true,day});
  }
  return json(502,{ok:false});
 }catch{return json(502,{ok:false})}
}
