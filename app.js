const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORAGE_KEY = 'laser_run_6e_v2';

const state = loadState();
let race = null;
let raf = null;

function uid(prefix='id'){
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

function loadState(){
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if(existing && Array.isArray(existing.classes)) return existing;
  } catch(_) {}

  // Migration douce de la V1 : l'ancienne classe devient une classe de la V2.
  const oldName = localStorage.getItem('bio_className');
  const oldStudents = JSON.parse(localStorage.getItem('bio_students') || '[]');
  const oldResults = JSON.parse(localStorage.getItem('bio_results') || '[]');
  if(oldName || oldStudents.length || oldResults.length){
    const classId = uid('class');
    return {
      classes: [{
        id: classId,
        name: oldName && oldName !== 'Ma classe' ? oldName : 'Ma classe',
        students: oldStudents.map(s => ({id: uid('stu'), name: s.name || String(s)})),
        results: {L1: oldResults.map(r => ({...r, classId}))}
      }],
      activeClassId: classId
    };
  }
  return {classes: [], activeClassId: null};
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function activeClass(){ return state.classes.find(c => c.id === state.activeClassId) || null; }
function setActiveClass(id){ state.activeClassId = id; save(); }
function show(id){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#'+id).classList.add('active');
  if(id==='homeView') renderHome();
  if(id==='classView') renderClassEditor();
  if(id==='classHubView') renderClassHub();
  if(id==='lessonView') populateLessonSelect();
  if(id==='resultsView') renderResults();
}

$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.newClass){ state.activeClassId = null; $('#className').value=''; }
  show(b.dataset.go);
}));

function renderHome(){
  const list = $('#homeClassList');
  list.innerHTML = '';
  $('#noClassMessage').classList.toggle('hidden', state.classes.length > 0);
  state.classes.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'class-card';
    btn.innerHTML = `
      <div><small>CLASSE DE 6ÈME</small><br><strong>${escapeHtml(c.name)}</strong></div>
      <div class="class-card-bottom"><small>${c.students.length} élève${c.students.length>1?'s':''}</small><span class="class-card-arrow">›</span></div>`;
    btn.addEventListener('click',()=>{ setActiveClass(c.id); show('classHubView'); });
    list.appendChild(btn);
  });
}

function renderClassEditor(){
  const c = activeClass();
  $('#className').value = c ? c.name : '';
  $('#classAdminPanel').classList.toggle('hidden', !c);
  $('#importMessage').classList.add('hidden');
  if(!c) return;
  $('#classTitle').textContent = c.name;
  $('#studentCount').textContent = `${c.students.length} élève${c.students.length>1?'s':''}`;
  const list = $('#studentList'); list.innerHTML='';
  c.students.forEach((s,i)=>{
    const el=document.createElement('div'); el.className='student-item';
    el.innerHTML=`<span class="student-name">${escapeHtml(s.name)}</span><button class="delete-btn" data-i="${i}">Supprimer</button>`;
    list.appendChild(el);
  });
  list.querySelectorAll('.delete-btn').forEach(b=>b.onclick=()=>{
    c.students.splice(+b.dataset.i,1); save(); renderClassEditor();
  });
}

$('#saveClassBtn').onclick=()=>{
  const name=$('#className').value.trim();
  if(!name){ alert('Indique le nom de la classe.'); return; }
  let c = activeClass();
  if(c){ c.name=name; }
  else {
    c={id:uid('class'),name,students:[],results:{L1:[]}};
    state.classes.push(c); state.activeClassId=c.id;
  }
  save(); renderClassEditor(); renderHome();
};

$('#addStudentBtn').onclick=()=>{
  const c=activeClass(); if(!c) return;
  const name=normalizeName($('#studentName').value); if(!name) return;
  addNamesToClass(c,[name]); $('#studentName').value=''; save(); renderClassEditor();
};

$('#openClassBtn').onclick=()=>show('classHubView');
$('#manageClassBtn').onclick=()=>show('classView');

function renderClassHub(){
  const c=activeClass();
  if(!c){ show('homeView'); return; }
  $('#hubClassName').textContent=c.name;
  $('#hubClassName2').textContent=c.name;
  $('#hubStudentCount').textContent=c.students.length;
}

$('.active-lesson').onclick=()=>{
  const c=activeClass();
  if(!c) return;
  if(!c.students.length){ alert('Ajoute ou importe d’abord les élèves de cette classe.'); show('classView'); return; }
  show('lessonView');
};
$$('[data-coming]').forEach(b=>b.onclick=()=>alert(`${b.dataset.coming} sera ajoutée dans une prochaine version.`));

// --- Import CSV / Excel ---
const fileInput=$('#studentFile');
const drop=$('#fileDrop');
fileInput.addEventListener('change',e=>{ if(e.target.files[0]) importStudentsFile(e.target.files[0]); e.target.value=''; });
['dragenter','dragover'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.add('dragging');}));
['dragleave','drop'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.remove('dragging');}));
drop.addEventListener('drop',e=>{const f=e.dataTransfer.files[0]; if(f) importStudentsFile(f);});

async function importStudentsFile(file){
  const c=activeClass(); if(!c) return;
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  try{
    let rows=[];
    if(ext==='csv'){
      const text=await file.text();
      rows=parseCsvNames(text);
    } else if(['xlsx','xls'].includes(ext)){
      if(typeof XLSX==='undefined') throw new Error('Le module Excel n’est pas disponible. Ouvre l’application une fois avec Internet puis réessaie.');
      const data=await file.arrayBuffer();
      const wb=XLSX.read(data,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const aoa=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,defval:''});
      rows=extractNamesFromRows(aoa);
    } else throw new Error('Format non reconnu. Utilise un fichier .csv, .xlsx ou .xls.');

    const before=c.students.length;
    addNamesToClass(c,rows);
    const added=c.students.length-before;
    save(); renderClassEditor();
    showImportMessage(`${added} élève${added>1?'s':''} importé${added>1?'s':''}. ${c.students.length} élève${c.students.length>1?'s':''} dans la classe.`,false);
  }catch(err){ showImportMessage(err.message || 'Impossible de lire ce fichier.',true); }
}

function parseCsvNames(text){
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(l=>l.trim());
  const rows=lines.map(line=>{
    const sep=line.includes(';')?';':(line.includes('\t')?'\t':',');
    return splitCsvLine(line,sep);
  });
  return extractNamesFromRows(rows);
}
function splitCsvLine(line,sep){
  const out=[]; let cur=''; let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted && line[i+1]==='"'){cur+='"';i++;} else quoted=!quoted;
    } else if(ch===sep && !quoted){out.push(cur);cur='';}
    else cur+=ch;
  }
  out.push(cur); return out;
}
function extractNamesFromRows(rows){
  const names=[];
  rows.forEach(row=>{
    const cells=(Array.isArray(row)?row:[row]).map(v=>String(v??'').trim()).filter(Boolean);
    if(!cells.length) return;
    let candidate='';
    if(cells.length===1) candidate=cells[0];
    else {
      // Si le fichier possède deux colonnes Nom / Prénom, elles sont automatiquement réunies.
      candidate=`${cells[0]} ${cells[1]}`;
    }
    candidate=normalizeName(candidate);
    const low=candidate.toLowerCase().replace(/[éèêë]/g,'e');
    if(['nom prenom','nom et prenom','prenom nom','eleve','eleves'].includes(low)) return;
    if(candidate) names.push(candidate);
  });
  return names;
}
function addNamesToClass(c,names){
  const existing=new Set(c.students.map(s=>normalizeName(s.name).toLocaleLowerCase('fr')));
  names.forEach(raw=>{
    const name=normalizeName(raw); const key=name.toLocaleLowerCase('fr');
    if(name && !existing.has(key)){c.students.push({id:uid('stu'),name});existing.add(key);}
  });
  c.students.sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
}
function normalizeName(v){return String(v||'').replace(/\s+/g,' ').trim();}
function showImportMessage(text,error){
  const el=$('#importMessage'); el.textContent=text; el.classList.remove('hidden','error'); if(error)el.classList.add('error');
}

// --- L1 ---
function populateLessonSelect(){
  const c=activeClass();
  if(!c){ show('homeView'); return; }
  $('#lessonClassLabel').textContent=c.name.toUpperCase();
  const sel=$('#lessonStudentSelect'); sel.innerHTML='';
  if(!c.students.length){ const o=document.createElement('option');o.textContent='Aucun élève dans cette classe';o.value='';sel.appendChild(o); $('#startBtn').disabled=true; return; }
  c.students.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=s.name;sel.appendChild(o)});
  $('#startBtn').disabled=false; resetRaceUI();
}
function resetRaceUI(){
  cancelAnimationFrame(raf); raf=null; race=null;
  $('#timer').textContent='00:00.0'; $('#status').textContent='Prêt à démarrer'; $('#lapLabel').textContent='1 / 4';
  const c=activeClass(); $('#startBtn').disabled=!c||!c.students.length; $('#shootBtn').disabled=true; $('#finishBtn').disabled=true; $('#shootPanel').classList.add('hidden');
}
function startRace(){
  const c=activeClass(); if(!c) return;
  const idx=+$('#lessonStudentSelect').value; if(Number.isNaN(idx)||!c.students[idx]) return;
  race={student:c.students[idx],classId:c.id,start:performance.now(),rawMs:0,lap:1,shootNo:0,shots:[],running:true};
  $('#startBtn').disabled=true; $('#shootBtn').disabled=false; $('#status').textContent='Course en cours'; tick();
}
function tick(){ if(!race||!race.running)return; race.rawMs=performance.now()-race.start; $('#timer').textContent=formatMs(race.rawMs); raf=requestAnimationFrame(tick); }
function openShoot(){
  if(!race||race.shootNo>=3)return; race.running=false;cancelAnimationFrame(raf);race.rawMs=performance.now()-race.start;
  race.current=[null,null,null,null,null]; $('#shootTitle').textContent=`Tir ${race.shootNo+1} / 3`; $('#targets').innerHTML='';
  race.current.forEach((_,i)=>{const b=document.createElement('button');b.className='target';b.textContent=i+1;b.onclick=()=>toggleTarget(i,b);$('#targets').appendChild(b)});
  updateShootSummary();$('#shootPanel').classList.remove('hidden');$('#shootBtn').disabled=true;$('#finishBtn').disabled=true;$('#status').textContent='Saisie du tir';
}
function toggleTarget(i,b){
  const val=race.current[i];
  if(val===null){race.current[i]=true;b.classList.add('hit');b.textContent='✓';}
  else if(val===true){race.current[i]=false;b.classList.remove('hit');b.classList.add('miss');b.textContent='✕';}
  else{race.current[i]=null;b.classList.remove('miss');b.textContent=i+1;}
  updateShootSummary();
}
function updateShootSummary(){const hits=race.current.filter(Boolean).length;const misses=race.current.filter(v=>v===false).length;$('#hitsCount').textContent=`${hits} / 5`;$('#penaltyCount').textContent=`+${misses*5} s`;}
function validateShoot(){
  if(race.current.some(v=>v===null)){alert('Renseigne les 5 tirs.');return;}
  race.shots.push([...race.current]);race.shootNo++;race.lap++;$('#shootPanel').classList.add('hidden');$('#lapLabel').textContent=`${race.lap} / 4`;
  race.start=performance.now()-race.rawMs;race.running=true;$('#status').textContent='Course en cours';$('#shootBtn').disabled=race.shootNo>=3;$('#finishBtn').disabled=race.shootNo<3;tick();
}
function finishRace(){
  if(!race||race.shootNo<3)return;race.running=false;cancelAnimationFrame(raf);race.rawMs=performance.now()-race.start;
  const flat=race.shots.flat();const hits=flat.filter(Boolean).length;const misses=15-hits;const penaltySec=misses*5;const corrected=race.rawMs+penaltySec*1000;
  const c=state.classes.find(x=>x.id===race.classId); if(!c) return; if(!c.results)c.results={L1:[]}; if(!c.results.L1)c.results.L1=[];
  const result={id:Date.now(),studentId:race.student.id,student:race.student.name,rawMs:Math.round(race.rawMs),hits,misses,penaltySec,correctedMs:Math.round(corrected),date:new Date().toISOString()};
  c.results.L1.push(result);save();
  $('#finalClassLabel').textContent=c.name.toUpperCase();$('#finalStudent').textContent=result.student;$('#finalRaw').textContent=formatMs(result.rawMs);$('#finalHits').textContent=`${hits} / 15`;$('#finalAccuracy').textContent=`${Math.round(hits/15*100)} %`;$('#finalPenalty').textContent=`${misses} × 5 s = +${penaltySec} s`;$('#finalCorrected').textContent=formatMs(result.correctedMs);
  show('finalView');resetRaceUI();
}
$('#startBtn').onclick=startRace;$('#shootBtn').onclick=openShoot;$('#validateShootBtn').onclick=validateShoot;$('#finishBtn').onclick=finishRace;

function renderResults(){
  const c=activeClass(); if(!c){show('homeView');return;}
  $('#resultsClassLabel').textContent=c.name.toUpperCase();
  const list=$('#resultsList');list.innerHTML='';const sorted=[...(c.results?.L1||[])].sort((a,b)=>a.correctedMs-b.correctedMs);
  if(!sorted.length){list.innerHTML='<p style="color:#66716f">Aucun résultat enregistré pour cette classe.</p>';return;}
  sorted.forEach((r,i)=>{const el=document.createElement('div');el.className='result-row';el.innerHTML=`<div class="rank">${i+1}</div><div><strong>${escapeHtml(r.student)}</strong><br><small>${r.hits}/15 · +${r.penaltySec}s</small></div><strong>${formatMs(r.correctedMs)}</strong>`;list.appendChild(el)});
}

$('#resetBtn').onclick=()=>{
  if(confirm('Effacer toutes les classes, tous les élèves et tous les résultats enregistrés sur cet appareil ?')){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem('bio_className');localStorage.removeItem('bio_students');localStorage.removeItem('bio_results');location.reload();}
};
function formatMs(ms){const total=ms/1000;const m=Math.floor(total/60);const s=Math.floor(total%60);const t=Math.floor((total-Math.floor(total))*10);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${t}`;}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

renderHome();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
