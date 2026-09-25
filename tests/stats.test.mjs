import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStoreNumber,sendUsage} from '../stats.mjs';
import handler from '../netlify/functions/store-usage.mjs';

test('numer sklepu ma poprawny format',()=>{
 assert.equal(normalizeStoreNumber(' z9164 '),'Z9164');
 assert.equal(normalizeStoreNumber('9164'),'Z9164');
 assert.equal(normalizeStoreNumber('../../sekret'),'');
 assert.equal(normalizeStoreNumber('Warszawa'),'');
});

test('brak endpointu nie wysyła numeru',async()=>{
 assert.deepEqual(await sendUsage('Z9164'),{ok:false,reason:'unconfigured'});
});

test('funkcja zapisuje tylko numer sklepu na dany dzień do repozytorium',async()=>{
 const oldFetch=globalThis.fetch;
 const oldToken=process.env.GITHUB_STATS_TOKEN,oldRepo=process.env.GITHUB_STATS_REPO;
 process.env.GITHUB_STATS_TOKEN='secret-example';process.env.GITHUB_STATS_REPO='owner/private-stats';
 const calls=[];
 globalThis.fetch=async(url,options)=>{
  calls.push({url,options});
  return new Response(null,{status:options.method==='PUT'?201:404});
 };
 try{
  const req=new Request('https://example.netlify.app/.netlify/functions/store-usage',{
   method:'POST',headers:{Origin:'https://kzawadzkii656.github.io','Content-Type':'application/json'},
   body:JSON.stringify({storeNumber:'Z9164',pdf:'poufny.pdf'})
  });
  const res=await handler(req),body=await res.json();
  assert.equal(res.status,201);assert.equal(body.ok,true);
  assert.match(calls[1].url,/\/contents\/activity\/\d{4}-\d{2}-\d{2}\/Z9164\.json$/);
  const saved=JSON.parse(Buffer.from(JSON.parse(calls[1].options.body).content,'base64').toString());
  assert.equal(saved.storeNumber,'Z9164');assert.equal('pdf' in saved,false);
  assert.equal(calls[1].options.headers.Authorization,'Bearer secret-example');
 }finally{
  globalThis.fetch=oldFetch;
  if(oldToken===undefined)delete process.env.GITHUB_STATS_TOKEN;else process.env.GITHUB_STATS_TOKEN=oldToken;
  if(oldRepo===undefined)delete process.env.GITHUB_STATS_REPO;else process.env.GITHUB_STATS_REPO=oldRepo;
 }
});

test('funkcja odrzuca wywołanie z innej strony',async()=>{
 const res=await handler(new Request('https://example.netlify.app/.netlify/functions/store-usage',{
  method:'POST',headers:{Origin:'https://obca-strona.example'},body:'{"storeNumber":"Z9164"}'
 }));
 assert.equal(res.status,403);
});
