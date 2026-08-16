const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = {
  className: localStorage.getItem('bio_className') || 'Ma classe',
  students: JSON.parse(localStorage.getItem('bio_students') || '[]'),
  results: JSON.parse(localStorage.getItem('bio_results') || '[]')
};
let race = null;
let raf = null;

function save(){
  localStorage.setItem('bio_className', state.className);
  localStorage.setItem('bio_students', JSON.stringify(state.students));
  localStorage.setItem('bio_results', JSON.stringify(state.results));
}
function show(id){ $$('.view').forEach(v=>v.classList.remove('active')); $('#'+id).classList.add('active'); if(id==='resultsView') renderResults(); if(id==='lessonView') populateLessonSelect(); }
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));

function renderClass(){
  $('#className').value = state.className === 'Ma classe' ? '' : state.className;
  $('#classTitle').textContent = state.className;
  $('#studentCount').textContent = `${state.students.length} élève${state.students.length>1?'s':''}`;
  const list = $('#studentList'); list.innerHTML='';
  state.students.forEach((s,i)=>{
    const el=document.createElement('div'); el.className='student-item';
    el.innerHTML=`<div><strong>${escapeHtml(s.name)}</strong><br><small>${escapeHtml(s.nation)}</small></div><button class="delete-btn" data-i="${i}">Supprimer</button>`;
    list.appendChild(el);
  });
  list.querySelectorAll('.delete-btn').forEach(b=>b.onclick=()=>{state.students.splice(+b.dataset.i,1);save();renderClass();populateLessonSelect();});
}
function populateLessonSelect(){
  const sel=$('#lessonStudentSelect'); sel.innerHTML='';
  if(!state.students.length){ const o=document.createElement('option');o.textContent='Ajoute d’abord un élève';o.value='';sel.appendChild(o); $('#startBtn').disabled=true; return; }
  state.students.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${s.name} — ${s.nation}`;sel.appendChild(o)});
  $('#startBtn').disabled=false;
  resetRaceUI();
}
$('#saveClassBtn').onclick=()=>{const v=$('#className').value.trim(); if(v) state.className=v; save();renderClass();};
$('#addStudentBtn').onclick=()=>{const name=$('#studentName').value.trim(); if(!name) return; state.students.push({name,nation:$('#nationSelect').value}); $('#studentName').value=''; save();renderClass();populateLessonSelect();};

function resetRaceUI(){
  cancelAnimationFrame(raf); raf=null; race=null;
  $('#timer').textContent='00:00.0'; $('#status').textContent='Prêt à démarrer'; $('#lapLabel').textContent='1 / 4';
  $('#startBtn').disabled=!state.students.length; $('#shootBtn').disabled=true; $('#finishBtn').disabled=true; $('#shootPanel').classList.add('hidden');
}
function startRace(){
  const idx=+$('#lessonStudentSelect').value; if(Number.isNaN(idx)||!state.students[idx]) return;
  race={student:state.students[idx],start:performance.now(),rawMs:0,lap:1,shootNo:0,shots:[],running:true};
  $('#startBtn').disabled=true; $('#shootBtn').disabled=false; $('#status').textContent='Course en cours'; tick();
}
function tick(){
  if(!race||!race.running) return; race.rawMs=performance.now()-race.start; $('#timer').textContent=formatMs(race.rawMs); raf=requestAnimationFrame(tick);
}
function openShoot(){
  if(!race||race.shootNo>=3) return; race.running=false; cancelAnimationFrame(raf); race.rawMs=performance.now()-race.start;
  race.current=[null,null,null,null,null];
  $('#shootTitle').textContent=`Tir ${race.shootNo+1} / 3`; $('#targets').innerHTML='';
  race.current.forEach((_,i)=>{const b=document.createElement('button');b.className='target';b.textContent=i+1;b.onclick=()=>toggleTarget(i,b);$('#targets').appendChild(b)});
  updateShootSummary(); $('#shootPanel').classList.remove('hidden'); $('#shootBtn').disabled=true; $('#finishBtn').disabled=true; $('#status').textContent='Saisie du tir';
}
function toggleTarget(i,b){
  const val=race.current[i];
  if(val===null){race.current[i]=true;b.classList.add('hit');b.textContent='✓';}
  else if(val===true){race.current[i]=false;b.classList.remove('hit');b.classList.add('miss');b.textContent='✕';}
  else{race.current[i]=null;b.classList.remove('miss');b.textContent=i+1;}
  updateShootSummary();
}
function updateShootSummary(){
  const hits=race.current.filter(Boolean).length; const misses=race.current.filter(v=>v===false).length;
  $('#hitsCount').textContent=`${hits} / 5`; $('#penaltyCount').textContent=`+${misses*5} s`;
}
function validateShoot(){
  if(race.current.some(v=>v===null)){alert('Renseigne les 5 tirs.');return;}
  race.shots.push([...race.current]); race.shootNo++; race.lap++;
  $('#shootPanel').classList.add('hidden'); $('#lapLabel').textContent=`${race.lap} / 4`;
  race.start=performance.now()-race.rawMs; race.running=true; $('#status').textContent='Course en cours';
  $('#shootBtn').disabled=race.shootNo>=3; $('#finishBtn').disabled=race.shootNo<3;
  tick();
}
function finishRace(){
  if(!race||race.shootNo<3) return; race.running=false; cancelAnimationFrame(raf); race.rawMs=performance.now()-race.start;
  const flat=race.shots.flat(); const hits=flat.filter(Boolean).length; const misses=15-hits; const penaltySec=misses*5; const corrected=race.rawMs+penaltySec*1000;
  const result={id:Date.now(),student:race.student.name,nation:race.student.nation,rawMs:Math.round(race.rawMs),hits,misses,penaltySec,correctedMs:Math.round(corrected),date:new Date().toISOString()};
  state.results.push(result); save();
  $('#finalStudent').textContent=`${result.student} — ${result.nation}`; $('#finalRaw').textContent=formatMs(result.rawMs); $('#finalHits').textContent=`${hits} / 15`; $('#finalAccuracy').textContent=`${Math.round(hits/15*100)} %`; $('#finalPenalty').textContent=`${misses} × 5 s = +${penaltySec} s`; $('#finalCorrected').textContent=formatMs(result.correctedMs);
  show('finalView'); resetRaceUI();
}
$('#startBtn').onclick=startRace; $('#shootBtn').onclick=openShoot; $('#validateShootBtn').onclick=validateShoot; $('#finishBtn').onclick=finishRace;

function renderResults(){
  const list=$('#resultsList'); list.innerHTML=''; const sorted=[...state.results].sort((a,b)=>a.correctedMs-b.correctedMs);
  if(!sorted.length){list.innerHTML='<p style="color:#9db2c8">Aucun résultat enregistré.</p>';return;}
  sorted.forEach((r,i)=>{const el=document.createElement('div');el.className='result-row';el.innerHTML=`<div class="rank">${i+1}</div><div><strong>${escapeHtml(r.student)}</strong><br><small>${escapeHtml(r.nation)} · ${r.hits}/15 · +${r.penaltySec}s</small></div><strong>${formatMs(r.correctedMs)}</strong>`;list.appendChild(el)});
}
$('#resetBtn').onclick=()=>{if(confirm('Effacer toutes les classes, élèves et résultats enregistrés ?')){localStorage.removeItem('bio_className');localStorage.removeItem('bio_students');localStorage.removeItem('bio_results');location.reload();}};
function formatMs(ms){ const total=ms/1000; const m=Math.floor(total/60); const s=Math.floor(total%60); const t=Math.floor((total-Math.floor(total))*10); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${t}`; }
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

renderClass(); populateLessonSelect();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
