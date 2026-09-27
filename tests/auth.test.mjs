import test from 'node:test';
import assert from 'node:assert/strict';
import {rememberedIdentity,accountDatabase,LOGIN_KEY} from '../auth.mjs';
const storage=value=>({getItem:key=>key===LOGIN_KEY?value:null});
const identity={sub:'123456',email:'test@example.test',verifiedAt:1000};
test('first use offers local or Google, invalid and expired remembered choices ignored',()=>{assert.equal(rememberedIdentity(storage(null)),null);assert.equal(rememberedIdentity(storage('{bad')),null);assert.deepEqual(rememberedIdentity(storage(JSON.stringify(identity)),2000),identity);assert.equal(rememberedIdentity(storage(JSON.stringify(identity)),1000+31*86400000),null);assert.equal(rememberedIdentity(storage(JSON.stringify(identity)),500),null)});
test('guest keeps existing local database and Google accounts are isolated',()=>{assert.equal(accountDatabase({sub:'local-guest',guest:true}),'marketing-sklepu');assert.equal(accountDatabase(identity),'marketing-sklepu-google-123456');assert.notEqual(accountDatabase(identity),accountDatabase({sub:'654321'}));assert.throws(()=>accountDatabase({sub:'../../test'}));assert.equal(rememberedIdentity(storage(JSON.stringify({...identity,guest:true})),2000),null)});
