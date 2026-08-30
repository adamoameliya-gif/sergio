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
  roundTotal:0
};

const catGood = ['😸','😺','🐱','😻'];
const catOops = ['🙀','😿','😾'];
const catTitles = [
  'Sergio, let’s crush this vocab test!',
  'Main character study mode: on.',
  'Big brain cat mode: activated.',
  'Study now. Zoomies later.',
  'Claw your way to an A, Sergio.',
  'Teen awesome mode: vocab grind activated.'
];
const catSubs = [
  'Meme Cat wisdom: short practice beats panic studying.',
  'Try one easy mode first, then go full Mixed Test goblin mode.',
  'Missed words come back, so the hard ones slowly become easy.',
  'You do not need perfect. You just need practice, Sergio.',
  'Tiny daily reps = less stress before the test.'
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const shuffle = a => { const x=[...a]; for(let i=x.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; } return x; };

function saveState(){
  try{
    localStorage.setItem('sergioCatVocab', JSON.stringify({
      score:state.score,
      hits:state.hits,
      wrong:[...state.wrong]
    }));
  }catch(e){}
}
function loadState(){
  try{
    const raw = localStorage.getItem('sergioCatVocab');
    if(!raw) return;
    const parsed = JSON.parse(raw);
    state.score = parsed.score || 0;
    state.hits = parsed.hits || state.hits;
    state.wrong = new Set(parsed.wrong || []);
  }catch(e){}
}

function updateHeroCat(icon=null, title=null, subtitle=null){
  $('#heroCat').textContent = icon || catGood[Math.floor(Math.random()*catGood.length)];
  $('#catTitle').textContent = title || catTitles[Math.floor(Math.random()*catTitles.length)];
  $('#catSubtitle').textContent = subtitle || catSubs[Math.floor(Math.random()*catSubs.length)];
}

function updateStats(){
  $('#score').textContent = state.score;
  $('#mastered').textContent = `${state.hits.filter(x => x >= 2).length}/20`;
  $('#missedCount').textContent = state.wrong.size;
  $('#missedLabel').textContent = state.wrong.size
    ? `${state.wrong.size} word${state.wrong.size===1?'':'s'} ready for extra practice`
    : 'No missed words yet — nice!';
  saveState();
}

function showMenu(){
  $('#game').classList.add('hidden');
  $('#finish').classList.add('hidden');
  $('#menu').classList.remove('hidden');
  updateHeroCat();
}

function modeTitle(m){
  return {
    definition:'Definition → Word',
    word:'Word → Definition',
    context:'Sentence Challenge',
    synonym:'Synonyms',
    antonym:'Antonyms',
    mixed:'Mixed Test',
    missed:'Missed Words'
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
    alert('No missed words yet — great job!');
    return;
  }
  state.order = shuffle(pool);
  $('#menu').classList.add('hidden');
  $('#finish').classList.add('hidden');
  $('#game').classList.remove('hidden');
  renderQuestion();
}

function distractWordIndexes(i){
  return shuffle(vocab.map((_,j)=>j).filter(j=>j!==i)).slice(0,3);
}

function buildQuestion(i){
  const v = vocab[i];
  let qMode = state.mode === 'mixed'
    ? shuffle(['definition','word','context','synonym','antonym'])[0]
    : state.mode;
  let label = '', prompt = '', answer = '', options = [];
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
    options = shuffle([v.def, ...shuffle(vocab.map((x,j)=>j).filter(j=>j!==i)).slice(0,3).map(j=>vocab[j].def)]);
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
    i, qMode, label, prompt, answer, options,
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
    b.onclick = ()=>answerQuestion(opt, b);
    $('#answers').appendChild(b);
  });

  updateHeroCat('😸', `Sergio, ${modeTitle(state.mode)} time.`, 'One question at a time. You got this.');
}

function answerQuestion(opt, btn){
  const q = window.currentQ;
  if(document.body.dataset.locked === '1') return;
  document.body.dataset.locked = '1';

  state.roundTotal++;
  let reaction = '';
  if(opt === q.answer){
    state.roundCorrect++;
    state.streak++;
    state.score += 100 + (state.streak - 1) * 10;
    state.hits[q.i]++;
    if(state.hits[q.i] >= 2) state.wrong.delete(q.i);
    btn.classList.add('correct');
    reaction = `<div class="cat-reaction">😸 Cat says: Purrfect. Brain gains unlocked!</div>`;
    $('#feedback').innerHTML = `${reaction}<strong>Correct!</strong><br>${q.explain}<br><span class="small">Example: ${q.example}</span>`;
    updateHeroCat(catGood[Math.floor(Math.random()*catGood.length)], 'Nice job.', 'That one looked strong. Keep the streak going.');
  } else {
    state.streak = 0;
    state.wrong.add(q.i);
    state.hits[q.i] = Math.max(0, state.hits[q.i] - 1);
    btn.classList.add('wrong');
    $$('.answer').forEach(b => {
      if(b.textContent === q.answer) b.classList.add('correct');
    });
    reaction = `<div class="cat-reaction">🙀 Cat says: No drama. Even smart cats miss one sometimes.</div>`;
    $('#feedback').innerHTML = `${reaction}<strong>Correct answer: ${q.answer}</strong><br>${q.explain}<br><span class="small">Example: ${q.example}</span>`;
    updateHeroCat(catOops[Math.floor(Math.random()*catOops.length)], 'Almost.', 'No problem — missed words come back for extra practice.');
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
    $('#finishMessage').textContent = 'Excellent. Cat-approved vocabulary powers unlocked.';
    updateHeroCat('😻','Cat Coach says: Meow-velous work.','You are ready for another mode or a quick Mixed Test.');
  } else if(pct >= 75){
    $('#finishEmoji').textContent = '🔥🐱';
    $('#finishMessage').textContent = 'Strong round. A quick review and you\'re golden.';
    updateHeroCat('😺','Nice round.','A little review now will make the hard words easier.');
  } else {
    $('#finishEmoji').textContent = '🧠🐾';
    $('#finishMessage').textContent = 'Good practice. Hit Missed Words next and level up.';
    updateHeroCat('🐱','Good effort.','Practice the missed words and then come back for round two.');
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

$$('.mode').forEach(b => b.addEventListener('click', ()=>startMode(b.dataset.mode)));
$('#missedBtn').addEventListener('click', ()=>startMode('missed'));
$('#back').addEventListener('click', showMenu);
$('#choose').addEventListener('click', showMenu);
$('#again').addEventListener('click', ()=>startMode(state.mode));
$('#next').addEventListener('click', nextQuestion);

buildStudySheet();
loadState();
updateStats();
updateHeroCat();