import test from 'node:test';
import assert from 'node:assert/strict';
import {documentForDate,documentPeriod} from '../documents.mjs';
const t39={id:'a',name:'MM T39_23.09-29.09.2026.pdf',created:'2026-09-25',cycle:{start:'2026-09-09',end:'2026-09-22'}};
const t40={id:'b',name:'MM T40_30.09-6.10.2026.pdf',created:'2026-09-26'};
test('wybór T39 i T40 na granicy tygodni niezależnie od kolejności importu',()=>{
 assert.equal(documentForDate([t40,t39],'2026-09-29').id,'a');
 assert.equal(documentForDate([t39,t40],'2026-09-30').id,'b');
 assert.equal(documentForDate([t39,t40],'2026-10-06').id,'b');
});
test('brak cyklu nie pokazuje zadań przypadkowego tygodnia',()=>{
 assert.equal(documentForDate([t39,t40],'2026-10-07'),null);
 assert.equal(documentForDate([],'2026-09-25'),null);
 assert.equal(documentForDate([{id:'x',name:'materialy.pdf'}],'2026-09-25'),null);
});
test('okres z nazwy ma pierwszeństwo przed datami reklam na pierwszej stronie',()=>{
 assert.deepEqual(documentPeriod(t39),{start:'2026-09-23',end:'2026-09-29'});
 assert.deepEqual(documentPeriod({name:'materialy.pdf',cycle:{start:'2026-09-23',end:'2026-09-29'}}),documentPeriod(t39));
});
test('nowszy import rozstrzyga nakładające się wersje tego samego cyklu',()=>{
 const revision={...t39,id:'c',created:'2026-09-28'};
 assert.equal(documentForDate([revision,t39],'2026-09-25').id,'c');
});
