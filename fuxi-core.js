"use strict";

/* ================= Werkzeuge ================= */
const F = (typeof window.__FUXI_FAST__ !== "undefined") && window.__FUXI_FAST__;
const app = document.getElementById("app");
const rnd  = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = arr => arr[rnd(0,arr.length-1)];
const shuffle = arr => { const c=arr.slice(); for(let i=c.length-1;i>0;i--){ const j=rnd(0,i); [c[i],c[j]]=[c[j],c[i]]; } return c; };

function store(k,v){ try{ localStorage.setItem("fuxi2_"+k, JSON.stringify(v)); }catch(e){} }
function recall(k,d){ try{ const v=localStorage.getItem("fuxi2_"+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } }

/* ================= Sound ================= */
const Sound = {
  on: recall("sound", true),
  ctx: null,
  tone(freq, start, dur, type, vol){
    if(!this.on) return;
    try{
      this.ctx = this.ctx || new (window.AudioContext||window.webkitAudioContext)();
      const t0 = this.ctx.currentTime + start;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type||"sine"; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol||0.16, t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t0); o.stop(t0+dur+0.06);
    }catch(e){}
  },
  tap(){ this.tone(650,0,.06,"triangle",.07); },
  good(){ this.tone(523,0,.1); this.tone(659,.09,.1); this.tone(784,.18,.16,"sine",.18); },
  ohno(){ this.tone(240,0,.16,"triangle",.12); this.tone(190,.12,.2,"triangle",.12); },
  star(){ this.tone(880,0,.09); this.tone(1174,.09,.09); this.tone(1568,.18,.2,"sine",.2); },
  levelup(){ [523,659,784,1046,1318].forEach((f,i)=>this.tone(f,i*.09,.18,"sine",.2)); },
  toggle(){ this.on=!this.on; store("sound",this.on); }
};
function buzz(p){ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} }

/* ================= Konfetti (Canvas) ================= */
const FX = {
  cv:null, ctx:null, parts:[], running:false,
  init(){
    this.cv = document.getElementById("fx");
    if(this.cv && this.cv.getContext){ try{ this.ctx = this.cv.getContext("2d"); }catch(e){ this.ctx=null; } }
    if(this.ctx){ const sz=()=>{ this.cv.width=innerWidth; this.cv.height=innerHeight; };
      sz(); addEventListener("resize", sz, {passive:true}); }
  },
  burst(n, x, y){
    if(!this.ctx){ this.init(); }
    if(!this.ctx) return;
    const colors=["#ffd93d","#7c5cff","#22d3ee","#ff8a3d","#22c55e","#ff6b9d"];
    x = (x==null ? innerWidth/2 : x); y = (y==null ? innerHeight*0.3 : y);
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, sp=4+Math.random()*8;
      this.parts.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-5,
        w:6+Math.random()*7, h:9+Math.random()*9, r:Math.random()*Math.PI,
        vr:(Math.random()-.5)*.3, c:pick(colors), life:70+Math.random()*40 });
    }
    if(!this.running){ this.running=true; this.tick(); }
  },
  tick(){
    const c=this.ctx;
    c.clearRect(0,0,this.cv.width,this.cv.height);
    this.parts = this.parts.filter(p=>p.life>0);
    for(const p of this.parts){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.18; p.vx*=0.99; p.r+=p.vr; p.life--;
      c.save(); c.translate(p.x,p.y); c.rotate(p.r);
      c.globalAlpha=Math.min(1,p.life/40);
      c.fillStyle=p.c; c.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      c.restore();
    }
    if(this.parts.length){ requestAnimationFrame(()=>this.tick()); }
    else { this.running=false; c.clearRect(0,0,this.cv.width,this.cv.height); }
  }
};
FX.init();

/* ================= Zustand ================= */
const S = {
  screen:"home", mod:null,
  exPage:0, exStep:0,
  qIdx:0, questions:[], attempts:0,
  firstTry:0, solved:0, xpGain:0, streak:0,
  input:"", reveal:false,
  gen:0
};
let xp = recall("xp", 0);
const LEVEL_STEP = 50;
const levelOf = v => 1+Math.floor(v/LEVEL_STEP);
const levelPct = v => (v%LEVEL_STEP)/LEVEL_STEP*100;

function newGen(){ return ++S.gen; }
function later(fn, ms){ const g=newGen(); setTimeout(()=>{ if(S.gen===g) fn(); }, F?5:ms); }

function opt(correct, pool, count){
  const out=[String(correct)];
  for(const c of shuffle(pool)){ if(out.length>=count) break; if(!out.includes(String(c))) out.push(String(c)); }
  return shuffle(out);
}
const KIDS = ["Emma","Ben","Lena","Jonas","Mia","Paul"];

/* ================= Uhr & Formen ================= */
function clockSVG(h,m){
  let ticks="";
  for(let i=0;i<12;i++){ const a=i*30*Math.PI/180;
    ticks += `<line x1="${100+88*Math.sin(a)}" y1="${100-88*Math.cos(a)}" x2="${100+79*Math.sin(a)}" y2="${100-79*Math.cos(a)}" stroke="#241d4f" stroke-width="${i%3?2.5:5}" stroke-linecap="round"/>`; }
  const ha=((h%12)*30+m*0.5)*Math.PI/180, ma=m*6*Math.PI/180;
  return `<svg viewBox="0 0 200 200" style="width:min(230px,58vw);height:auto;margin:4px auto;display:block">
    <circle cx="100" cy="100" r="97" fill="#fff" stroke="#5b3fd6" stroke-width="8"/>
    ${ticks}
    <line x1="100" y1="100" x2="${100+44*Math.sin(ha)}" y2="${100-44*Math.cos(ha)}" stroke="#241d4f" stroke-width="9" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="${100+70*Math.sin(ma)}" y2="${100-70*Math.cos(ma)}" stroke="#ff8a3d" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="7" fill="#5b3fd6"/></svg>`;
}
function timeLabel(h,m){
  if(m===0) return h+" Uhr";
  if(m===15) return "Viertel nach "+h;
  if(m===30) return "halb "+(h+1===13?1:h+1);
  return "Viertel vor "+(h+1===13?1:h+1);
}
const SHAPES=[
  {name:"Dreieck", n:3, svg:`<svg viewBox="0 0 120 120" width="150"><polygon points="60,12 112,106 8,106" fill="#ffd93d" stroke="#e6a800" stroke-width="5" stroke-linejoin="round"/></svg>`},
  {name:"Quadrat", n:4, svg:`<svg viewBox="0 0 120 120" width="150"><rect x="15" y="15" width="90" height="90" rx="8" fill="#2dd4bf" stroke="#0d9488" stroke-width="5"/></svg>`},
  {name:"Rechteck", n:4, svg:`<svg viewBox="0 0 160 120" width="170"><rect x="10" y="22" width="140" height="76" rx="8" fill="#fb7185" stroke="#e11d48" stroke-width="5"/></svg>`},
  {name:"Kreis", n:0, svg:`<svg viewBox="0 0 120 120" width="150"><circle cx="60" cy="60" r="50" fill="#60a5fa" stroke="#2563eb" stroke-width="5"/></svg>`},
];

/* ================= Module ================= */
const MODULES = [
{ id:"zahlen", ic:"🔢", name:"Zahlen bis 100", desc:"Nachbarn, vergleichen, Zehnerschritte", tint:"#ede9fe",
  ex:[
    {t:"Nachbarzahlen", s:["Jede Zahl hat Nachbarn: <b>47</b> → davor die <b>46</b>, danach die <b>48</b>.","Bei <b>49</b> kommt danach die <b>50</b> – pass auf bei den Zehnern auf!"]},
    {t:"Vergleichen", s:["<b>34 &lt; 43</b> – die Spitze zeigt immer zur kleineren Zahl.","<b>&lt;</b> heißt kleinere Zahl, <b>&gt;</b> heißt größere Zahl, <b>=</b> heißt gleich."] },
    {t:"Zehnerschritte", s:["10 mehr heißt: eine Zehner-Stufe höher. <b>63 + 10 = 73</b>","10 weniger: <b>63 − 10 = 53</b>. Die Einer bleiben gleich!"]}
  ],
  gen(){ const k=rnd(0,3);
    if(k===0){ const a=rnd(10,98), b=rnd(10,98), sym=a===b?"=":(a>b?">":"<");
      return {q:`<div class="bigq">${a} <span class="hole">⬜</span> ${b}</div><div class="qtext">Welches Zeichen passt in die Lücke?</div>`, options:opt(sym,["<",">","="],3), answer:String(sym), hint:"Die Spitze zeigt zur kleineren Zahl!"}; }
    if(k===1){ const n=rnd(11,98);
      return {q:`<div class="bigq">${n}</div><div class="qtext">Welche Zahl kommt direkt danach?</div>`, options:opt(n+1,[n,n-1,n+2,n+3,n-2],4), answer:String(n+1), hint:"Denk an den Nachbarn rechts in der Zahlenreihe."}; }
    if(k===2){ const n=rnd(11,89), up=Math.random()<0.5, res=up?n+10:n-10;
      return {q:`<div class="qtext">Rechne im Kopf:</div><div class="bigq">${n} ${up?"+":"−"} 10 = <span class="hole">?</span></div>`, answer:String(res), pad:true, hint:"Nur die Zehner ändern sich, die Einer bleiben!"}; }
    const n=rnd(11,98);
    return {q:`<div class="bigq">${n}</div><div class="qtext">Welche Zahl kommt direkt davor?</div>`, options:opt(n-1,[n,n+1,n-2,n+2,n-3],4), answer:String(n-1), hint:"Der Nachbar links in der Zahlenreihe!"}; }
},
{ id:"plusminus", ic:"➕", name:"Plus & Minus bis 100", desc:"mit und ohne Zehnerübergang", tint:"#dcfce7",
  ex:[
    {t:"Plus ohne Übergang", s:["<b>34 + 25</b>: Erst die Zehner: 30 + 20 = <b>50</b>.","Dann die Einer: 4 + 5 = <b>9</b>. Zusammen: <b>59</b>!"]},
    {t:"Plus mit Übergang", s:["<b>47 + 25</b>: Erst 47 + 20 = <b>67</b>.","Dann 67 + 5 = <b>72</b> – über den Zehner gehüpft!"]},
    {t:"Minus", s:["<b>52 − 30</b>: Nur die Zehner weg → <b>22</b>.","<b>52 − 7</b>: Erst − 2 bis auf 50, dann noch − 5 → <b>45</b>."]}
  ],
  gen(){ if(Math.random()<0.45){ const res=rnd(11,89), b=rnd(3,30), a=res+b;
      return {q:`<div class="bigq">${a} − ${b} = <span class="hole">?</span></div>`, answer:String(res), pad:true, hint:"Zieh erst die Zehner ab, dann die Einer."}; }
    if(Math.random()<0.5){ const e=rnd(2,8), a=10*rnd(1,8)+e, b=10-e+rnd(1,3);
      return {q:`<div class="bigq">${a} + ${b} = <span class="hole">?</span></div>`, answer:String(a+b), pad:true, hint:"Erst zum vollen Zehner, dann den Rest dazu."}; }
    const a=rnd(11,60), b=rnd(11,39);
    return {q:`<div class="bigq">${a} + ${b} = <span class="hole">?</span></div>`, answer:String(a+b), pad:true, hint:"Erst die Zehner, dann die Einer addieren."}; }
},
{ id:"einmaleins", ic:"✖️", name:"Kleines Einmaleins", desc:"Reihen 1 bis 10", tint:"#ffedd5",
  ex:[
    {t:"Was heißt 3 × 4?", s:["3 × 4 heißt: <b>3-mal die 4</b> nehmen.","4 + 4 + 4 = <b>12</b>.","💡 Tipp: Du darfst tauschen! 3 × 4 = 4 × 3 = 12."]},
    {t:"Zaubertricks", s:["<b>7 × 10</b> = 70 – einfach eine 0 hinten dran!","Die <b>5er-Reihe</b> endet immer auf 5 oder 0: 5, 10, 15, 20 …","Die <b>2er-Reihe</b> ist Verdoppeln: 2, 4, 6, 8 …"]}
  ],
  gen(){ const a=pick([2,3,4,5,6,7,8,9,10]), b=rnd(1,10), r=a*b;
    return {q:`<div class="bigq">${a} × ${b} = <span class="hole">?</span></div>`, options:opt(r,[r+a,r-b,r+b,r-a,a+b,r+10,Math.abs(r-10)],4), answer:String(r), hint:"Dreh die Aufgabe um oder zähle die Reihe weiter!"}; }
},
{ id:"zerlegen", ic:"🎲", name:"Zerlegen & Verdoppeln", desc:"Zahlentricks für Profis", tint:"#fce7f3",
  ex:[
    {t:"Zahlen zerlegen", s:["<b>8</b> passt in viele Teile: 4 + 4, 3 + 5, 2 + 6 …","Such-Typ: 8 = 3 + <b>5</b> – die fehlende Zahl ergänzen!"]},
    {t:"Verdoppeln & Halbieren", s:["Verdoppeln heißt: <b>die Zahl zu sich selbst dazunehmen</b>. 12 + 12 = <b>24</b>.","Halbieren ist das Gegenteil: 24 → <b>12</b>."]}
  ],
  gen(){ const k=rnd(0,2);
    if(k===0){ const tot=rnd(6,20), p=rnd(1,tot-1), res=tot-p;
      return {q:`<div class="bigq">${tot} = ${p} + <span class="hole">?</span></div><div class="qtext">Welche Zahl fehlt?</div>`, options:opt(res,[res+1,res-1,res+2,tot,p],4), answer:String(res), hint:"Zähl von "+p+" hoch bis "+tot+"."}; }
    if(k===1){ const n=rnd(3,45);
      return {q:`<div class="qtext">Verdopple die Zahl:</div><div class="bigq">2 × ${n} = <span class="hole">?</span></div>`, answer:String(n*2), pad:true, hint:"Rechne "+n+" + "+n+"."}; }
    const n=rnd(2,50);
    return {q:`<div class="qtext">Halbiere die Zahl:</div><div class="bigq">${n*2} : 2 = <span class="hole">?</span></div>`, answer:String(n), pad:true, hint:"Welche Zahl plus sich selbst ergibt "+(n*2)+"?"}; }
},
{ id:"uhr", ic:"⏰", name:"Uhrzeit lesen", desc:"ganze, halbe & viertel Stunden", tint:"#cffafe",
  ex:[
    {t:"Ganze Stunde", s:["Der <b>kurze</b> Zeiger zeigt auf die 3, der <b>lange</b> auf die 12.","Es ist <b>3 Uhr</b>."]},
    {t:"Halbe Stunde", s:["Der lange Zeiger zeigt auf die <b>6</b>.","Der kurze Zeiger steht zwischen 3 und 4 → es ist <b>halb 4</b> (3:30)."]},
    {t:"Viertel", s:["Langer Zeiger auf der <b>3</b> → <b>Viertel nach 3</b> (3:15).","Langer Zeiger auf der <b>9</b> → <b>Viertel vor 4</b> (3:45)."]}
  ],
  gen(){ const h=rnd(1,12), m=pick([0,15,30,45]), c=timeLabel(h,m), wrongs=new Set();
    while(wrongs.size<3){ const h2=rnd(1,12), m2=pick([0,15,30,45]); const l=timeLabel(h2,m2); if(h2!==h) wrongs.add(l); }
    return {q:`<div class="qtext">Wie spät ist es?</div>${clockSVG(h,m)}`, options:opt(c,[...wrongs],4), answer:c, hint:"Schau genau auf den langen Minutenzeiger."}; }
},
{ id:"geld", ic:"💰", name:"Euro & Geld", desc:"Einkaufen & Wechselgeld", tint:"#fef9c3",
  ex:[
    {t:"Zusammenzählen", s:["Ein Heft kostet <b>2 €</b>, ein Stift <b>3 €</b>.","2 € + 3 € = <b>5 €</b>."]},
    {t:"Wechselgeld", s:["Du bezahlst mit <b>10 €</b>, es kostet <b>7 €</b>.","10 − 7 = <b>3 €</b> bekommst du zurück."]}
  ],
  gen(){
    const things=[["ein Buch 📕",2,8],["einen Stift ✏️",1,3],["einen Ranzen 🎒",9,15],["einen Saft 🥣",1,2],["einen Keks 🍪",1,3],["ein Kuscheltier 🧸",5,12]];
    if(Math.random()<0.5){
      const t1=pick(things), rest=things.filter(x=>x[0]!==t1[0]), t2=pick(rest);
      const a=rnd(t1[1],t1[2]), b=rnd(t2[1],t2[2]);
      return {q:`<div class="qtext">Du kaufst ${t1[0]} für ${a} €<br>und ${t2[0]} für ${b} €.</div><div class="bigq">Alles zusammen: <span class="hole">?</span> €</div>`, answer:String(a+b), pad:true, hint:"Addiere die beiden Preise."}; }
    const p=rnd(2,9);
    return {q:`<div class="qtext">Es kostet <b>${p} €</b>.<br>Du bezahlst mit einem 10-€-Schein.</div><div class="bigq">Wechselgeld: <span class="hole">?</span> €</div>`, answer:String(10-p), pad:true, hint:"Rechne 10 − "+p+"."}; }
},
{ id:"formen", ic:"📐", name:"Formen & Geometrie", desc:"Figuren erkennen & zählen", tint:"#d9f99d",
  ex:[ {t:"Die Formen", s:["<b>Dreieck</b>: 3 Ecken, 3 Seiten · <b>Quadrat</b>: 4 gleiche Seiten","<b>Rechteck</b>: 4 Ecken, 2 lange + 2 kurze Seiten · <b>Kreis</b>: hat gar keine Ecken!"]} ],
  gen(){ const s=pick(SHAPES);
    if(Math.random()<0.5) return {q:`<div class="qtext">Wie heißt diese Form?</div><div class="visual">${s.svg}</div>`, options:opt(s.name,SHAPES.map(x=>x.name),4), answer:s.name, hint:"Zähle die Ecken und Seiten!"};
    return {q:`<div class="qtext">Wie viele <b>Ecken</b> hat diese Form?</div><div class="visual">${s.svg}</div>`, options:opt(s.n,[0,1,2,3,4,5,6],4), answer:String(s.n), hint:"Zähle die spitzen Punkte der Form ab."}; }
},
{ id:"muster", ic:"🧩", name:"Reihen & Muster", desc:"Was kommt als Nächstes?", tint:"#e0e7ff",
  ex:[ {t:"Muster entdecken", s:["<b>2, 4, 6, 8, ?</b> – immer + 2 → die Antwort ist <b>10</b>.","Manchmal geht es rückwärts: <b>20, 15, 10, ?</b> – immer − 5 → <b>5</b>.","Tipp: Rechne den Abstand zwischen zwei Nachbarzahlen aus!"]} ],
  gen(){
    const step=pick([2,3,5,10]), up=Math.random()<0.5;
    let base=rnd(2,20); if(!up) base+=step+2;
    let list=[], answerVal;
    for(let i=0;i<4;i++) list.push(up? base+i*step : base+(3-i)*step);
    answerVal = up? base+4*step : base-step;
    return {q:`<div class="qtext">Setze die Reihe fort:</div><div class="bigq" style="font-size:clamp(26px,7vw,40px)">${list.join(", ")}, <span class="hole">?</span></div>`, answer:String(answerVal), pad:true, hint:"Rechne den Abstand zwischen zwei Nachbarzahlen."}; }
},
{ id:"messen", ic:"📏", name:"Längen & Messen", desc:"cm und Meter", tint:"#bae6fd",
  ex:[ {t:"cm und m", s:["Ein Lineal misst in <b>cm</b>. Dein Zeigefinger ist etwa 5 cm lang.","<b>1 m = 100 cm</b> – ein Meter sind 100 Zentimeter.","Eine Tür ist etwa 2 m hoch, also 200 cm."]} ],
  gen(){ const k=rnd(0,2);
    if(k===0){ const n=rnd(1,5); return {q:`<div class="qtext">Wie viele cm sind <b>${n} m</b>?</div><div class="bigq">${n} m = <span class="hole">?</span> cm</div>`, answer:String(n*100), pad:true, hint:"1 m = 100 cm."}; }
    if(k===1){ const n=rnd(1,5); return {q:`<div class="qtext">Wie viele Meter sind <b>${n*100} cm</b>?</div><div class="bigq">${n*100} cm = <span class="hole">?</span> m</div>`, answer:String(n), pad:true, hint:"100 cm ergeben 1 m."}; }
    const a=rnd(30,180), b=a+rnd(20,80);
    return {q:`<div class="qtext">Was ist länger?</div><div class="bigq" style="font-size:clamp(22px,6vw,34px)">${a} cm &nbsp;oder&nbsp; ${b} cm</div>`, options:opt(b+" cm",[a+" cm","gleich lang","weiß nicht"],3), answer:b+" cm", hint:"Die größere Zahl ist die längere Strecke."}; }
},
{ id:"text", ic:"📖", name:"Sachaufgaben", desc:"Geschichten zum Mitrechnen", tint:"#ddd6fe",
  ex:[ {t:"So gehst du vor", s:["1. <b>Lesen</b>: Was genau ist gefragt?","2. <b>Rechnen</b>: Plus, minus oder mal?","3. Beispiel: 8 Murmeln + 4 gefundene = <b>12 Murmeln</b>. Fertig! 🎯"]} ],
  gen(){ const name=pick(KIDS), k=rnd(0,3);
    if(k===0){ const a=rnd(5,40), b=rnd(3,25);
      return {q:`<div class="qtext">🍬 ${name} hat ${a} Bonbons.<br>Zum Geburtstag kommen ${b} dazu.</div><div class="bigq">Wie viele jetzt?</div>`, answer:String(a+b), pad:true, hint:"„kommen dazu“ heißt: Plus rechnen!"}; }
    if(k===1){ const a=rnd(20,60), b=rnd(3,15);
      return {q:`<div class="qtext">🧦 In der Wäsche sind ${a} Socken.<br>${b} Socken verschwinden in der Waschmaschine.</div><div class="bigq">Wie viele bleiben?</div>`, answer:String(a-b), pad:true, hint:"„verschwinden“ heißt: Minus rechnen!"}; }
    if(k===2){ const a=rnd(2,6), b=rnd(2,9);
      return {q:`<div class="qtext">📦 Es gibt ${a} Kartons.<br>In jedem Karton liegen ${b} Äpfel.</div><div class="bigq">Wie viele Äpfel insgesamt?</div>`, answer:String(a*b), pad:true, hint:"„in jedem“ heißt: Mal rechnen ("+a+" × "+b+")."}; }
    const t=pick([10,20,50]), p=rnd(2,t-2);
    return {q:`<div class="qtext">💵 ${name} hat ${t} € gespart und kauft ein Spiel für ${p} €.</div><div class="bigq">Wie viele € bleiben übrig?</div>`, answer:String(t-p), pad:true, hint:"„bleiben übrig“ heißt: Minus rechnen ("+t+" − "+p+")."}; }
}
];
