const vocab = [
{w:'adjacent',def:'near, next to, adjoining',syn:['nearby','neighboring'],ant:['distant','faraway'],sent:'The library is ___ to the school, so students can walk there quickly.'},
{w:'alight',def:'to get down from or come down from; to land',syn:['dismount','land'],ant:['board','mount'],sent:'The passengers began to ___ from the bus when it reached the museum.'},
{w:'barren',def:'not productive; bare',syn:['sterile','desolate'],ant:['fertile','fruitful'],sent:'After months without rain, the field looked dry and ___.'},
{w:'disrupt',def:'to break up or disturb',syn:['disturb','interrupt'],ant:['organize','arrange'],sent:'A loud fire alarm can ___ a class.'},
{w:'dynasty',def:'a powerful family or group of rulers that keeps power for a long time',syn:['ruling house','regime'],ant:['temporary rule','single term'],sent:'For generations, the same royal family controlled the kingdom as a powerful ___.'},
{w:'foretaste',def:'an advance indication, sample, or warning of something to come',syn:['preview','anticipation'],ant:['aftermath','ending'],sent:'The first chapter gave readers a ___ of the adventure ahead.'},
{w:'germinate',def:'to begin to grow or come into being',syn:['sprout','develop'],ant:['wither','die'],sent:'With enough water and sunlight, the seeds will ___.'},
{w:'humdrum',def:'ordinary, dull, routine, without variation',syn:['boring','monotonous'],ant:['exciting','thrilling'],sent:'The same ___ routine every day made him wish for a new challenge.'},
{w:'hurtle',def:'to rush violently or dash headlong',syn:['speed','dash'],ant:['crawl','creep'],sent:'The roller coaster seemed to ___ down the steep track.'},
{w:'insinuate',def:'to suggest or hint slyly or indirectly',syn:['imply','hint'],ant:['state directly','announce'],sent:'Without saying it clearly, she tried to ___ that someone had cheated.'},
{w:'interminable',def:'endless or so long that it seems endless',syn:['never-ending','endless'],ant:['brief','short'],sent:'The long airport delay felt ___ to the tired travelers.'},
{w:'interrogate',def:'to ask questions or examine by questioning',syn:['question','query'],ant:['answer','ignore'],sent:'The detectives needed to ___ the witness.'},
{w:'recompense',def:'to repay or reward; a payment for loss, service, or injury',syn:['repay','compensation'],ant:['penalty','loss'],sent:'The owner offered money to ___ the worker for the extra hours.'},
{w:'renovate',def:'to repair, restore, or make new again',syn:['repair','restore'],ant:['damage','neglect'],sent:'The family plans to ___ the old kitchen.'},
{w:'résumé',def:'a brief written summary of education, work experience, and qualifications',syn:['work summary','job history'],ant:['novel','full biography'],sent:'Before applying for the summer job, he updated his ___.'},
{w:'sullen',def:'silent or gloomy because of anger or resentment',syn:['grumpy','morose'],ant:['cheerful','vivacious'],sent:'After losing the game, he became ___ and barely spoke.'},
{w:'trickle',def:'to flow or fall by drops or in a small stream',syn:['dribble','drip'],ant:['gush','flood'],sent:'Water began to ___ slowly from the cracked bottle.'},
{w:'trivial',def:'not important; minor; commonplace',syn:['insignificant','minor'],ant:['important','weighty'],sent:'The coach ignored the ___ details and focused on the main problem.'},
{w:'truce',def:'a pause in fighting; temporary peace',syn:['cease-fire','temporary peace'],ant:['war','warfare'],sent:'The two sides agreed to a short ___.'},
{w:'vicious',def:'evil, spiteful, malicious, or painfully severe',syn:['wicked','malicious'],ant:['kind','mild'],sent:'A ___ rumor spread through school and hurt her feelings.'}
];

let state = {
  mode:null,
  order:[],
  idx:0,
  score:0,
  streak:0,
  wrong:new Set(),
  hits:Array(vocab.length).fill(0),
  roundCorrect:0,
  roundTotal:0,
  analytics:{
    totalAnswered:0,
    totalCorrect:0,
    bestStreak:0,
    lastActive:null,
    modeRuns:{definition:0,word:0,context:0,synonym:0,antonym:0,mixed:0,missed:0},
    wordStats:Array.from({length:vocab.length},()=>({correct:0,wrong:0}))
  }
};

const PARENT_PIN = '2725';

const memeWins = [
  {pic:'😼',title:'Big Brain Cat Mode',text:'Streak rising. Sergio is cooking.'},
  {pic:'😹',title:'Purrfect',text:'Brain gains unlocked.'},
  {pic:'😻',title:'Main Character Energy',text:'That answer was clean.'},
  {pic:'🐯',title:'Locked In',text:'Study now. Zoomies later.'}
];
const memeOops = [
  {pic:'🙀',title:'No drama',text:'Even smart cats miss one sometimes.'},
  {pic:'😿',title:'Reset and run it back',text:'One miss does not cancel the comeback.'},
  {pic:'😾',title:'Bro...',text:'The cat saw that. Try again next round.'}
];
const streakPopups = {
  3:{pic:'😼',title:'3 in a row!',text:'Nice. Big brain cat mode activated.'},
  5:{pic:'😻',title:'5 streak!',text:'You are actually locked in right now.'},
  8:{pic:'🐯',title:'8 streak!',text:'Okay Sergio, this is elite homework behavior.'}
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const shuffle = a => { const x=[...a]; for(let i=x.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; } return x; };

function saveState(){
  try{
    localStorage.setItem('sergioVocabQuest', JSON.stringify({
      score:state.score,
      hits:state.hits,
      wrong:[...state.wrong],
      analytics:state.analytics
    }));
  }catch(e){}
}
function loadState(){
  try{
    const raw = localStorage.getItem('sergioVocabQuest');
    if(!raw) return;
    const parsed = JSON.parse(raw);
    state.score = parsed.score || 0;
    state.hits = parsed.hits || state.hits;
    state.wrong = new Set(parsed.wrong || []);
    if(parsed.analytics){
      state.analytics.totalAnswered = parsed.analytics.totalAnswered || 0;
      state.analytics.totalCorrect = parsed.analytics.totalCorrect || 0;
      state.analytics.bestStreak = parsed.analytics.bestStreak || 0;
      state.analytics.lastActive = parsed.analytics.lastActive || null;
      state.analytics.modeRuns = {...state.analytics.modeRuns, ...(parsed.analytics.modeRuns || {})};
      if(Array.isArray(parsed.analytics.wordStats)){
        state.analytics.wordStats = state.analytics.wordStats.map((base,i)=>({ ...base, ...(parsed.analytics.wordStats[i] || {}) }));
      }
    }
  }catch(e){}
}
function updateStats(){
  $('#score').textContent = state.score;
  $('#mastered').textContent = `${state.hits.filter(x => x >= 2).length}/20`;
  $('#missedCount').textContent = state.wrong.size;
  $('#missedLabel').textContent = state.wrong.size
    ? `${state.wrong.size} word${state.wrong.size===1?'':'s'} ready for a comeback`
    : 'No missed words yet — nice.';
  saveState();
}
function showPopup(obj){
  $('#popupPic').textContent = obj.pic;
  $('#popupTitle').textContent = obj.title;
  $('#popupText').textContent = obj.text;
  $('#popupOverlay').classList.add('show');
}
function hidePopup(){
  $('#popupOverlay').classList.remove('show');
}
$('#popupContinue').onclick = hidePopup;
$('#popupClose').onclick = hidePopup;
$('#popupOverlay').addEventListener('click', e => {
  if(e.target.id === 'popupOverlay') hidePopup();
});

function showMenu(){
  $('#game').classList.add('hidden');
  $('#finish').classList.add('hidden');
  $('#menu').classList.remove('hidden');
}
function modeTitle(m){
  return {
    definition:'Definition → Word',
    word:'Word → Definition',
    context:'Sentence Challenge',
    synonym:'Synonyms',
    antonym:'Antonyms',
    mixed:'Mixed Test',
    missed:'Comeback Mode'
  }[m] || m;
}
function startMode(mode){
  state.mode = mode;
  state.idx = 0;
  state.roundCorrect = 0;
  state.roundTotal = 0;
  state.streak = 0;
  let pool = mode === 'missed' ? [...state.wrong] : vocab.map((_,i)=>i);
  if(!pool.length){
    showPopup({pic:'😺',title:'No missed words',text:'Nothing to review right now. That is a flex.'});
    return;
  }
  state.order = shuffle(pool);
  state.analytics.modeRuns[mode] = (state.analytics.modeRuns[mode] || 0) + 1;
  state.analytics.lastActive = new Date().toISOString();
  saveState();
  $('#menu').classList.add('hidden');
  $('#finish').classList.add('hidden');
  $('#game').classList.remove('hidden');
  renderQuestion();
}
function distractWordIndexes(i){
  return shuffle(vocab.map((_,j)=>j!==i?j:null).filter(v=>v!==null)).slice(0,3);
}
function buildQuestion(i){
  const v = vocab[i];
  const qMode = state.mode === 'mixed'
    ? shuffle(['definition','word','context','synonym','antonym'])[0]
    : state.mode;
  let label='', prompt='', answer='', options=[];
  if(qMode === 'definition'){
    label = 'What word means…';
    prompt = v.def;
    answer = v.w;
    options = shuffle([v.w, ...distractWordIndexes(i).map(j=>vocab[j].w)]);
  }
  if(qMode === 'word'){
    label = 'Choose the best definition';
    prompt = v.w;
    answer = v.def;
    options = shuffle([v.def, ...shuffle(vocab.map((x,j)=>j!==i?j:null).filter(v=>v!==null)).slice(0,3).map(j=>vocab[j].def)]);
  }
  if(qMode === 'context'){
    label = 'Complete the sentence';
    prompt = v.sent.replace('___','□□□□');
    answer = v.w;
    options = shuffle([v.w, ...distractWordIndexes(i).map(j=>vocab[j].w)]);
  }
  if(qMode === 'synonym'){
    label = 'Choose the closest meaning';
    prompt = `${v.w} is closest in meaning to…`;
    answer = v.syn[0];
    const pool = shuffle(vocab.flatMap((x,j)=>j===i ? [] : x.syn).filter(x=>x!==answer));
    options = shuffle([answer, ...pool.slice(0,3)]);
  }
  if(qMode === 'antonym'){
    label = 'Choose the opposite meaning';
    prompt = `Which choice is an antonym of ${v.w}?`;
    answer = v.ant[0];
    const pool = shuffle(vocab.flatMap((x,j)=>j===i ? [] : x.ant).filter(x=>x!==answer));
    options = shuffle([answer, ...pool.slice(0,3)]);
  }
  return {
    i,qMode,label,prompt,answer,options,
    explain:`${v.w} = ${v.def}`,
    example:v.sent.replace('___', v.w)
  };
}
function renderQuestion(){
  const q = buildQuestion(state.order[state.idx]);
  window.currentQ = q;
  document.body.dataset.locked = '0';
  $('#modeName').textContent = modeTitle(state.mode);
  $('#progressText').textContent = `${state.idx+1}/${state.order.length}`;
  $('#streak').textContent = state.streak;
  $('#bar').style.width = `${((state.idx+1)/state.order.length)*100}%`;
  $('#label').textContent = q.label;
  $('#question').textContent = q.prompt;
  $('#answers').innerHTML = '';
  $('#feedback').classList.add('hidden');
  $('#next').classList.add('hidden');
  q.options.forEach(opt=>{
    const b = document.createElement('button');
    b.className = 'answer';
    b.textContent = opt;
    b.onclick = ()=>answerQuestion(opt,b);
    $('#answers').appendChild(b);
  });
}
function trackAnswer(wordIndex, isCorrect){
  state.analytics.totalAnswered++;
  if(isCorrect) state.analytics.totalCorrect++;
  const item = state.analytics.wordStats[wordIndex] || {correct:0,wrong:0};
  if(isCorrect) item.correct++; else item.wrong++;
  state.analytics.wordStats[wordIndex] = item;
  state.analytics.lastActive = new Date().toISOString();
  state.analytics.bestStreak = Math.max(state.analytics.bestStreak, state.streak);
}

function renderParentDashboard(){
  const a = state.analytics;
  const accuracy = a.totalAnswered ? Math.round((a.totalCorrect/a.totalAnswered)*100) : 0;
  $('#parentAccuracy').textContent = `${accuracy}%`;
  $('#parentAnswered').textContent = a.totalAnswered;
  $('#parentBestStreak').textContent = a.bestStreak;
  $('#parentMastered').textContent = `${state.hits.filter(x=>x>=2).length}/${vocab.length}`;
  $('#parentLastActive').textContent = a.lastActive ? `Last activity: ${new Date(a.lastActive).toLocaleString()}` : 'No activity yet';

  const labels={definition:'Definition → Word',word:'Word → Definition',context:'Sentences',synonym:'Synonyms',antonym:'Antonyms',mixed:'Mixed Test',missed:'Comeback Mode'};
  $('#parentModes').innerHTML = Object.entries(a.modeRuns).map(([key,val])=>`<span class="mode-chip">${labels[key] || key}: <b>${val}</b></span>`).join('');

  $('#parentWordRows').innerHTML = vocab.map((v,i)=>{
    const ws=a.wordStats[i] || {correct:0,wrong:0};
    const total=ws.correct+ws.wrong;
    const pct=total ? Math.round((ws.correct/total)*100) : 0;
    let status='Not practiced';
    let cls='';
    if(total){
      if(ws.wrong>=2 || pct<70){status='Needs practice';cls='needs-work';}
      else if(pct>=85 && total>=2){status='Strong';cls='strong-word';}
      else status='Learning';
    }
    return `<tr><td><b>${v.w}</b></td><td>${ws.correct}</td><td>${ws.wrong}</td><td>${total?pct+'%':'—'}</td><td class="${cls}">${status}</td></tr>`;
  }).join('');
}

function openParentMode(){
  $('#parentPin').value='';
  $('#parentPinError').textContent='';
  $('#parentGate').classList.remove('hidden');
  $('#parentDashboard').classList.add('hidden');
  $('#parentOverlay').classList.add('show');
  $('#parentOverlay').setAttribute('aria-hidden','false');
  setTimeout(()=>$('#parentPin').focus(),50);
}

function closeParentMode(){
  $('#parentOverlay').classList.remove('show');
  $('#parentOverlay').setAttribute('aria-hidden','true');
}

function unlockParentMode(){
  if($('#parentPin').value !== PARENT_PIN){
    $('#parentPinError').textContent='Wrong PIN. Try again.';
    $('#parentPin').select();
    return;
  }
  renderParentDashboard();
  $('#parentGate').classList.add('hidden');
  $('#parentDashboard').classList.remove('hidden');
}

function answerQuestion(opt, btn){
  const q = window.currentQ;
  if(document.body.dataset.locked === '1') return;
  document.body.dataset.locked = '1';
  state.roundTotal++;
  let reactionObj;
  if(opt === q.answer){
    state.roundCorrect++;
    state.streak++;
    state.score += 100 + (state.streak - 1) * 10;
    state.hits[q.i]++;
    if(state.hits[q.i] >= 2) state.wrong.delete(q.i);
    trackAnswer(q.i, true);
    btn.classList.add('correct');
    reactionObj = memeWins[Math.floor(Math.random()*memeWins.length)];
    $('#feedback').innerHTML = `<div class="reaction">${reactionObj.pic} ${reactionObj.title}</div><strong>Correct!</strong><br>${q.explain}<br><span class="small">Example: ${q.example}</span>`;
    if(streakPopups[state.streak]) setTimeout(()=>showPopup(streakPopups[state.streak]), 300);
    if((state.idx+1) % 5 === 0 && state.idx+1 < state.order.length){
      setTimeout(()=>showPopup({pic:'😹',title:'Checkpoint reached',text:'Five questions down. Keep the streak alive.'}), 350);
    }
  } else {
    state.streak = 0;
    state.wrong.add(q.i);
    state.hits[q.i] = Math.max(0, state.hits[q.i] - 1);
    trackAnswer(q.i, false);
    btn.classList.add('wrong');
    $$('.answer').forEach(b=>{ if(b.textContent === q.answer) b.classList.add('correct'); });
    reactionObj = memeOops[Math.floor(Math.random()*memeOops.length)];
    $('#feedback').innerHTML = `<div class="reaction">${reactionObj.pic} ${reactionObj.title}</div><strong>Correct answer: ${q.answer}</strong><br>${q.explain}<br><span class="small">Example: ${q.example}</span>`;
  }
  $$('.answer').forEach(b => b.disabled = true);
  $('#feedback').classList.remove('hidden');
  $('#next').classList.remove('hidden');
  $('#streak').textContent = state.streak;
  updateStats();
}
function nextQuestion(){
  document.body.dataset.locked = '0';
  state.idx++;
  if(state.idx >= state.order.length) finishRound();
  else renderQuestion();
}
function finishRound(){
  $('#game').classList.add('hidden');
  $('#finish').classList.remove('hidden');
  const pct = Math.round((state.roundCorrect / Math.max(1, state.roundTotal)) * 100);
  $('#finishScore').textContent = `${state.roundCorrect} of ${state.roundTotal} correct • ${pct}%`;
  if(pct >= 90){
    $('#finishEmoji').textContent = '🏆😻';
    $('#finishMessage').textContent = 'Excellent. Cat-approved vocab powers unlocked.';
    setTimeout(()=>showPopup({pic:'🏆',title:'Victory',text:'That was elite. The cat fully approves.'}), 250);
  } else if(pct >= 75){
    $('#finishEmoji').textContent = '🔥😼';
    $('#finishMessage').textContent = 'Strong round. One quick review and you are golden.';
    setTimeout(()=>showPopup({pic:'🔥',title:'Strong round',text:'You are close. Run it back once more.'}), 250);
  } else {
    $('#finishEmoji').textContent = '🧠🐾';
    $('#finishMessage').textContent = 'Good practice. Hit Comeback Mode next.';
    setTimeout(()=>showPopup({pic:'🧠',title:'Good effort',text:'Do Comeback Mode and the hard words will get easier.'}), 250);
  }
}
function buildStudySheet(){
  const study = $('#study');
  study.innerHTML = '';
  vocab.forEach((v,i)=>{
    const d = document.createElement('div');
    d.className = 'study';
    d.innerHTML = `<b>${i+1}. ${v.w}</b>
      <div class="small" style="margin-top:5px">${v.def}</div>
      <div class="small" style="margin-top:8px">Closest meaning: ${v.syn[0]} • Opposite: ${v.ant[0]}</div>`;
    study.appendChild(d);
  });
}
$$('.mode').forEach(b=>b.addEventListener('click',()=>startMode(b.dataset.mode)));
$('#missedBtn').addEventListener('click',()=>startMode('missed'));
$('#back').addEventListener('click', showMenu);
$('#choose').addEventListener('click', showMenu);
$('#again').addEventListener('click', ()=>startMode(state.mode));
$('#next').addEventListener('click', nextQuestion);
$('#parentBtn').addEventListener('click', openParentMode);
$('#parentUnlock').addEventListener('click', unlockParentMode);
$('#parentCancel').addEventListener('click', closeParentMode);
$('#parentClose').addEventListener('click', closeParentMode);
$('#parentPin').addEventListener('keydown', e=>{ if(e.key==='Enter') unlockParentMode(); });
$('#parentOverlay').addEventListener('click', e=>{ if(e.target.id==='parentOverlay') closeParentMode(); });
buildStudySheet();
loadState();
updateStats();