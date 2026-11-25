/* ================= Tipps ================= */
const TIPS = [
  "Super gerechnet! 🎉","Du bist auf einem guten Weg! 🌟","Wow, das war richtig schnell! ⚡",
  "Klasse! Weiter so! 💪","Fuxi ist stolz auf dich! 🦊","Richtig! Du bist ein Mathe-Profi! 🧠",
  "Genau richtig! 🎯","Spitze! Sehr gut gemacht! ✨"
];
function praise(){ return pick(TIPS); }

/* ================= Bausteine ================= */
function header(withHome){
  return `<div class="top">
    <div class="brand"><span class="logo">🦊</span><h1>Fuxi<small>Lern-App · Mathe 2. Klasse</small></h1></div>
    ${withHome?`<button class="chip" data-act="home" aria-label="Startseite">🏠</button>`:""}
    <button class="chip" data-act="help" aria-label="Hilfe">❓</button>
    <button class="chip" data-act="settings" aria-label="Einstellungen">⚙️</button>
  </div>`;
}
function levelBar(){
  return `<div class="levelwrap"><span class="levelbadge">Level ${levelOf(xp)}</span>
    <div class="xpbar"><div class="xpfill" style="width:${levelPct(xp)}%"></div></div>
    <span class="xptext">${xp % LEVEL_STEP} / ${LEVEL_STEP} XP</span></div>`;
}
function modCard(m,i){
  const best=recall("best_"+m.id,0);
  const fresh=(m.id==="muster"||m.id==="messen")?`<span class="fresh">NEU</span>`:"";
  return `<button class="mod" data-act="open" data-arg="${i}">
    ${fresh}<span class="ic" style="background:${m.tint}">${m.ic}</span>
    <h3>${m.name}</h3><p>${m.desc}</p>
    <div class="meter"><i style="width:${best}%"></i></div>
    <div class="best">${best>0 ? "Bestleistung: "+best+" % ⭐" : "Noch nicht gespielt"}</div>
  </button>`;
}

/* ================= Startseite ================= */
function renderHome(){
  S.screen="home"; S.mod=null; newGen(); S.input=""; S.reveal=false;
  app.innerHTML = header() + levelBar() + `
    <div class="foxrow"><div class="fox">🦊</div>
      <div class="bubble">Hallo! Ich bin <b>Fuxi</b>. Such dir ein Abenteuer aus – <b>erst schauen wir uns ein Beispiel an</b>, dann üben wir! 🚀</div>
    </div>
    <div class="grid">${MODULES.map(modCard).join("")}</div>
    <p class="footnote">Fuxi V2 · 10 Module · offline spielbar · XP & Level</p>`;
}

/* ================= Beispiel (Pflicht vor jeder Runde) ================= */
function renderExample(){
  const m=MODULES[S.mod];
  if(!m){ renderHome(); return; }
  if(S.exPage>=m.ex.length){ S.exPage=0; S.exStep=0; }
  const ex=m.ex[S.exPage];
  const allSteps = m.ex.reduce((n,e)=>Math.max(n,e.s.length),0);
  const lastStep = S.exStep>=ex.s.length-1;
  const lastPage = S.exPage>=m.ex.length-1;
  const pageDots = m.ex.map((e,p)=>`<i class="${p===S.exPage?"on":(p<S.exPage?"done":"")}"></i>`).join("");
  const stepDots = ex.s.map((s,st)=>`<i class="${st===S.exStep?"on":(st<S.exStep?"done":"")}"></i>`).join("");
  let nextBtn;
  if(!lastStep) nextBtn=`<button class="btn" data-act="step">Weiter ▶</button>`;
  else if(!lastPage) nextBtn=`<button class="btn orange" data-act="page">Weiteres Beispiel ▶</button>`;
  else nextBtn=`<button class="btn orange" data-act="start">Jetzt üben! 🚀</button>`;
  app.innerHTML = header(true) + `
    <div class="headline"><h2>${m.ic} ${m.name}</h2><span class="qbadge">📖 Beispiel ${S.exPage+1} von ${m.ex.length}</span></div>
    <div class="hero">
      <span class="qtext" style="display:block;color:var(--ink-soft);font-weight:700">${ex.t}</span>
      <ul class="steps"><li>${ex.s[S.exStep]}</li></ul>
      <div class="stepdots">${stepDots}</div>
      ${m.ex.length>1?`<div class="stepdots">${pageDots}</div>`:""}
      <div class="btnrow">
        ${(S.exPage>0||S.exStep>0)?`<button class="btn ghost small" data-act="back-step">◀ Zurück</button>`:""}
        ${nextBtn}
        ${(!lastPage||!lastStep)?`<button class="btn small" data-act="start">Übung starten 🚀</button>`:""}
      </div>
      <p class="sub">Schritt ${S.exStep+1} von ${ex.s.length} · hast du alles verstanden? Dann los!</p>
    </div>
    <p class="footnote">Dein Fortschritt: ${allSteps} Erklär-Schritte gesamt in diesem Modul</p>`;
  S.screen="example";
}

function openModule(i){
  S.mod=i; S.exPage=0; S.exStep=0; newGen(); S.input=""; S.reveal=false;
  renderExample();
}

/* ================= Quiz ================= */
function startRound(){
  const m=MODULES[S.mod];
  S.questions=[]; S.qIdx=0; S.attempts=0; S.firstTry=0; S.solved=0; S.xpGain=0;
  S.input=""; S.reveal=false; S.tries=0; S.lock=false;
  for(let i=0;i<10;i++) S.questions.push(m.gen());
  S.xpBefore=xp;
  renderQuiz();
}

function renderQuiz(){
  S.screen="quiz";
  const m=MODULES[S.mod];
  app.innerHTML = header(true) + `
    <div class="headline"><h2>${m.ic} ${m.name}</h2><span class="qbadge">✏️ ${S.qIdx+1} / ${S.questions.length}</span></div>
    <div class="track"><i style="width:${(S.qIdx/S.questions.length)*100}%"></i></div>
    <div id="qzone"></div>
    <p class="footnote">Erfolg – aber wie? Mache aus Fehlern Lern-Schritte! 🧡</p>`;
  showQuestion();
}

function showQuestion(){
  const cur=S.questions[S.qIdx];
  S.tries=0; S.input=""; S.lock=false;
  const streakBadge = S.streak>=2 ? `<span class="streak">🔥 ${S.streak}</span>` : "";
  const frame = head => `<div class="qcard">${streakBadge}${cur.q}${head}
    <div class="feedback hidden" id="fb"></div></div>`;
  if(cur.options){
    const btns = cur.options.map(o=>`<button class="option" data-act="opt" data-arg="${String(o).replace(/"/g,"&quot;")}">${o}</button>`).join("");
    document.getElementById("qzone").innerHTML = frame(`<div class="options">${btns}</div>`);
  } else {
    const keys=[1,2,3,4,5,6,7,8,9,"del",0,"ok"];
    const btns = keys.map(k=>{
      if(k==="del") return `<button class="delb" data-act="num" data-arg="del">✖</button>`;
      if(k==="ok")  return `<button class="okb" data-act="check">✔</button>`;
      return `<button data-act="num" data-arg="${k}">${k}</button>`;
    }).join("");
    document.getElementById("qzone").innerHTML = frame(`
      <div class="numdisplay" id="numdisplay">&nbsp;</div>
      <div class="numpad" style="margin:12px auto 0">${btns}</div>`);
  }
}

function setFb(kind,text){
  const fb=document.getElementById("fb");
  if(!fb) return;
  fb.className="feedback "+kind; fb.innerHTML=text;
}
function markOption(btn,cls,disable){
  if(btn){ btn.classList.add(cls); if(disable) btn.disabled=true; }
}

/* ================= Antwort-Logik (XP, Tipp, 2-Versuch-Pädagogik) ================= */
function answerRight(btn){
  const cur=S.questions[S.qIdx];
  S.lock=true; S.solved++;
  const first = S.tries===0;
  if(first){ S.firstTry++; S.streak++; }
  const gain = first ? (S.streak>=3 ? 8 : 6) : 3;
  S.xpGain+=gain; xp+=gain; store("xp",xp);
  Sound.good(); buzz(30); FX.burst(26);
  if(btn) markOption(btn,"good",true);
  if(!cur.pad){ document.querySelectorAll("#qzone .option").forEach(b=>b.disabled=true); }
  setFb("good", first ? praise()+" <b>+"+gain+" XP</b>" : "Trotzdem geschafft! <b>+3 XP</b>");
  later(()=>{
    S.qIdx++;
    if(S.qIdx>=S.questions.length) showResult(); else renderQuiz();
  }, 950);
}
function answerWrong(btn){
  const cur=S.questions[S.qIdx];
  S.tries++;
  if(S.tries===1){
    Sound.ohno(); buzz([60,40,60]);
    markOption(btn,"ohno",true);
    S.input="";
    const d=document.getElementById("numdisplay"); if(d) d.textContent="\u00a0";
    setFb("bad","💡 "+cur.hint+"<br>Probier es nochmal – du schaffst das!");
  } else {
    S.lock=true; S.streak=0;
    Sound.ohno(); buzz([80,60,80,60,80]);
    if(cur.pad && document.getElementById("numdisplay")) document.getElementById("numdisplay").textContent=cur.answer;
    document.querySelectorAll("#qzone .option").forEach(b=>{ if(b.dataset.arg===String(cur.answer)) markOption(b,"good",false); b.disabled=true; });
    setFb("info","Die richtige Lösung ist: <b>"+cur.answer+"</b> – merke sie dir, wir machen weiter! 🔎");
    later(()=>{
      S.qIdx++;
      if(S.qIdx>=S.questions.length) showResult(); else renderQuiz();
    }, 1600);
  }
}

/* ================= Ergebnis ================= */
function starsFor(pct){ return pct>=90?3:pct>=60?2:pct>=30?1:0; }
function showResult(){
  S.screen="result"; newGen();
  const m=MODULES[S.mod];
  const pct=S.solved*10;
  const key="best_"+m.id;
  if(pct>recall(key,0)) store(key,pct);
  const st=starsFor(pct);
  const medal=st===3?"🏆":st===2?"🌟":st>=1?"💪":"🌱";
  Sound[st>=2 ? "star":"good"]();
  if(st>=2) FX.burst(st===3?110:70);
  const stars=[0,1,2].map(i=>`<span style="animation-delay:${.2+i*.25}s">${i<st?"⭐":"☆"}</span>`).join("");
  app.innerHTML = header() + `
    <div class="hero center" style="max-width:520px;margin:0 auto">
      <span class="medal">${medal}</span>
      <div class="starsline">${stars}</div>
      <h2 style="margin:2px 0 6px">${st===3?"Perfekt!":st===2?"Sehr gut!":st>=1?"Gut gemacht!":"Weiter üben!"}</h2>
      <div class="xpplus">+${S.xpGain} XP</div>
      <div class="stat2">
        <span class="chip stat">✅ ${S.solved}/${S.questions.length} richtig</span>
        <span class="chip stat">🎯 ${S.firstTry} beim 1. Versuch</span>
        ${S.streak>=2?`<span class="chip stat">🔥 Serie: ${S.streak}</span>`:""}
      </div>
      <div class="btnrow">
        <button class="btn orange" data-act="start">Nochmal üben 🔁</button>
        <button class="btn ghost" data-act="home">Alle Module 🏠</button>
      </div>
    </div>` + levelBar();
  const beforeLevel=levelOf(xp-S.xpGain), nowLevel=levelOf(xp);
  if(nowLevel>beforeLevel) later(()=>showLevelUp(nowLevel),1100);
}
function showLevelUp(lvl){
  Sound.levelup(); FX.burst(130);
  const ov=document.createElement("div");
  ov.className="overlay";
  ov.dataset.act="overlay-close";
  ov.dataset.overlay="1";
  ov.innerHTML=`<div class="levelup" data-act="no"><span class="big">🦊</span>
    <h2>Level ${lvl} erreicht!</h2>
    <p style="font-size:20px;font-weight:700">Du wirst immer schlauer! 🎉</p>
    <button class="btn orange" data-act="overlay-close">Hurra! 🎉</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector(".levelup").dataset.act="no";
}

/* ================= Overlays: Hilfe & Einstellungen ================= */
function overlay(html){
  const old=document.querySelector(".overlay[data-overlay]"); if(old) old.remove();
  const ov=document.createElement("div");
  ov.className="overlay"; ov.dataset.act="overlay-close"; ov.dataset.overlay="1";
  ov.innerHTML=`<div class="hero" data-act="no" style="max-width:460px">${html}</div>`;
  document.body.appendChild(ov);
}
function showHelp(){
  overlay(`<h2>🦊 Wie funktioniert das?</h2>
    <ul class="steps">
      <li>1️⃣ Wähle ein Modul – <b>immer zuerst kommt ein Beispiel</b>.</li>
      <li>2️⃣ Beim Üben: 1. Versuch falsch? Du bekommst einen <b>Tipp</b> und darfst wieder raten.</li>
      <li>3️⃣ 2. Versuch falsch? Wir zeigen dir die <b>Lösung</b> und rechnen gemeinsam weiter.</li>
      <li>4️⃣ Richtige Antworten geben <b>XP</b> – ab Levelaufstieg regnet Konfetti! 🎉</li>
    </ul>
    <div class="btnrow"><button class="btn" data-act="overlay-close">Verstanden! 👍</button></div>`);
}
function showSettings(){
  overlay(`<h2>⚙️ Einstellungen</h2>
    <div class="btnrow" style="flex-direction:column">
      <button class="btn ghost" data-act="sound">${Sound.on?"🔊 Ton: an":"🔇 Ton: aus"}</button>
      <button class="btn ghost small" data-act="reset">🗑️ Fortschritt zurücksetzen</button>
      <button class="btn small" data-act="overlay-close">Schließen ✖</button>
    </div>
    <p class="sub" style="text-align:center;margin-top:10px">Fuxi V2 · funktioniert offline</p>`);
}

/* ================= Zentrale Event-Delegation (Anti-Bug-Kern) ================= */
document.addEventListener("click", function(e){
  const t=e.target.closest("[data-act]");
  if(!t) return;
  const act=t.dataset.act, arg=t.dataset.arg;
  switch(act){
    case "no": return;
    case "open": openModule(parseInt(arg,10) || 0); break;
    case "home": renderHome(); break;
    case "beispiele": if(S.mod!=null) renderExample(); break;
    case "step": {
      if(S.mod==null) return;
      const ex=MODULES[S.mod].ex[S.exPage];
      if(S.exStep<ex.s.length-1) S.exStep++;
      else if(S.exPage<MODULES[S.mod].ex.length-1){ S.exPage++; S.exStep=0; }
      renderExample(); break;
    }
    case "page": {
      if(S.mod==null) return;
      if(S.exPage<MODULES[S.mod].ex.length-1){ S.exPage++; S.exStep=0; renderExample(); }
      else renderExample();
      break;
    }
    case "back-step": {
      if(S.mod==null) return;
      if(S.exStep>0) S.exStep--;
      else if(S.exPage>0){ S.exPage--; S.exStep=MODULES[S.mod].ex[S.exPage].s.length-1; }
      renderExample(); break;
    }
    case "start": if(S.mod!=null) startRound(); break;
    case "opt": {
      if(S.lock || S.screen!=="quiz") return;
      const cur=S.questions[S.qIdx];
      if(String(arg)===String(cur.answer)) answerRight(t); else answerWrong(t);
      break;
    }
    case "num": {
      if(S.lock || S.screen!=="quiz") return;
      if(arg==="del") S.input=S.input.slice(0,-1);
      else if(S.input.length<3) S.input+=arg;
      const d=document.getElementById("numdisplay");
      if(d) d.textContent = S.input || "\u00a0";
      break;
    }
    case "check": {
      if(S.lock || S.screen!=="quiz" || !S.input) return;
      const cur=S.questions[S.qIdx];
      if(S.input===String(cur.answer)) answerRight(null); else answerWrong(null);
      break;
    }
    case "help": showHelp(); break;
    case "settings": showSettings(); break;
    case "sound": Sound.toggle(); showSettings(); break;
    case "reset": {
      try{ Object.keys(localStorage).filter(k=>k.indexOf("fuxi2_")===0).forEach(k=>localStorage.removeItem(k)); }catch(err){}
      xp=0; renderHome(); showSettings(); break;
    }
    case "overlay-close": {
      const ov=t.closest(".overlay"); if(ov) ov.remove();
      break;
    }
  }
});
/* Doppel-Tipp auf Flush-Zoom verhindern */
document.addEventListener("dblclick", e=>e.preventDefault());

renderHome();
window.__fuxi = { S, MODULES, xpGet:()=>xp };
