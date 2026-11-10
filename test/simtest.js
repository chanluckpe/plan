// Node: load engine + sports, simulate every preset, print events summary
const fs=require('fs'); const vm=require('vm');
const ctx={console, Math, JSON, Object, Array, Set, Date, performance:{now:()=>0}, requestAnimationFrame:()=>0, cancelAnimationFrame:()=>0};
vm.createContext(ctx);
for(const f of ['engine.js','sports1.js','sports2.js','sports3.js','sports4.js','sports5.js','sports6.js','sports7.js']) vm.runInContext(fs.readFileSync(__dirname+'/../src/'+f,'utf8'), ctx, {filename:f});
vm.runInContext(`
for(const sp of SPORTS){
  for(const pr of sp.presets){
    let base=null;
    if(pr.side && pr.side!=='both'){ const o = sp.presets.find(q=>q.side && q.side!==pr.side); base = presetToPlay(sp, o); }
    const play = presetToPlay(sp, pr, base);
    try{
      const r = simulate(sp, play);
      const evs = r.ev.map(e=>(e.big?'★':'')+e.txt+'@'+e.t.toFixed(2)).join(' | ');
      console.log(sp.id.padEnd(10), pr.id.padEnd(12), 'dur', r.dur.toFixed(1), '::', evs);
      // svg sanity
      fieldInner(sp, play, {editor:true, handles:true});
    }catch(e){ console.log('ERR', sp.id, pr.id, e.stack); }
  }
}`, ctx);
