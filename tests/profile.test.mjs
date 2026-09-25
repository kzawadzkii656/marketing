import test from 'node:test';import assert from 'node:assert/strict';import {exclusion,groups} from '../profile.mjs';
const task=(source,title='Plakat')=>({id:'p1-1',page:1,source,title});
test('Warszawa odrzuca materiał wyłącznie dla Wielkopolski, ale nie przy nieznanym województwie',()=>{
 const t=task('Materiał obowiązuje tylko w sklepach w Wielkopolsce.');
 assert.equal(exclusion(t,{city:'Warszawa',facts:{region:'mazowieckie'}}),'Materiał tylko dla Wielkopolski');
 assert.equal(exclusion(t,{city:'Warszawa',facts:{}}),'');
});
test('część sklepów w Warszawie pozostaje do sprawdzenia',()=>{
 const t=task('Listwa nie obowiązuje w części sklepów w Warszawie, które już mają poprzedni materiał.');
 assert.equal(exclusion(t,{city:'Warszawa',facts:{}}),'');
});
test('wyłączenie samego standu nie usuwa kompletu z wobblerem',()=>{
 const t=task('Ekspozycja standu nie dotyczy sklepów w miastach: Warszawa. Wobblery pozostają.');
 assert.equal(exclusion(t,{city:'Warszawa',facts:{}}),'');
});
test('negatywny warunek miasta i wariant FLEX',()=>{
 assert.match(exclusion(task('Nie dotyczy sklepów w miastach: Warszawa, Kraków.'),{city:'Warszawa',facts:{}}),/Warszawa/);
 assert.match(exclusion(task('Materiał dla sklepów FLEX','Plakaty zewnętrzne – sklepy FLEX'),{facts:{flex:'no'}}),/FLEX/);
});
test('wszystkie klucze ustawień są unikalne',()=>{const keys=groups.flatMap(g=>g.fields.map(f=>f[0]));assert.equal(new Set(keys).size,keys.length);assert.ok(keys.length>=30)});
