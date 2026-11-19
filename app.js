const englishVocab = [
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
const spanishNumbers=[{n:1,w:'uno',p:'oo-no'},{n:2,w:'dos',p:'dohs'},{n:3,w:'tres',p:'trehs'},{n:4,w:'cuatro',p:'koo-ah-troh'},{n:5,w:'cinco',p:'seen-coh'},{n:6,w:'seis',p:'say-es'},{n:7,w:'siete',p:'see-eh-teh'},{n:8,w:'ocho',p:'oh-choh'},{n:9,w:'nueve',p:'noo-eh-veh'},{n:10,w:'diez',p:'dee-ehs'}];
const PARENT_PIN='2725';
const SUPABASE_URL='https://qqkktuqmhbmyudvfpeke.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_v2xslEZBIrIPtWB724F8Sw_8b-1HpFE';
const DEVICE_TOKEN_KEY='sergioCloudDeviceToken';
const LAST_CLOUD_SYNC_KEY='sergioLastCloudSync';
const cloudClient=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) || null;
let cloudSyncTimer=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const state={set:null,mode:null,order:[],idx:0,score:0,streak:0,roundCorrect:0,roundTotal:0,englishWrong:new Set(),spanishWrong:new Set(),builderLetters:[],analytics:{totalAnswered:0,totalCorrect:0,bestStreak:0,lastActive:null,modeRuns:{},spanishStats:Array.from({length:10},()=>({correct:0,wrong:0}))}};
function localSnapshot(){return {schemaVersion:1,score:state.score,englishWrong:[...state.englishWrong],spanishWrong:[...state.spanishWrong],analytics:state.analytics}}
function save(){try{localStorage.setItem('sergioStudyHub',JSON.stringify(localSnapshot()))}catch(e){}}
function load(){try{const x=JSON.parse(localStorage.getItem('sergioStudyHub')||'null');if(!x)return;state.score=x.score||0;state.englishWrong=new Set(x.englishWrong||[]);state.spanishWrong=new Set(x.spanishWrong||[]);state.analytics={...state.analytics,...(x.analytics||{})};if(!Array.isArray(state.analytics.spanishStats))state.analytics.spanishStats=Array.from({length:10},()=>({correct:0,wrong:0}))}catch(e){}}
function updateHeader(){$('#score').textContent=state.score;$('#answeredCount').textContent=state.analytics.totalAnswered;$('#bestStreak').textContent=state.analytics.bestStreak;$('#englishMissedLabel').textContent=state.englishWrong.size?`${state.englishWrong.size} word${state.englishWrong.size===1?'':'s'} to review.`:'No missed English words yet.';$('#spanishMissedLabel').textContent=state.spanishWrong.size?`${state.spanishWrong.size} Spanish number${state.spanishWrong.size===1?'':'s'} to review.`:'No missed Spanish numbers yet.';save();updateCloudStatus();queueCloudSync()}
function showOnly(id){['hub','englishMenu','spanishMenu','game','finish'].forEach(x=>$('#'+x).classList.toggle('hidden',x!==id))}
function showHub(){state.set=null;showOnly('hub')}
function showSetMenu(set){state.set=set;showOnly(set==='english'?'englishMenu':'spanishMenu')}
function popup(pic,title,text){$('#popupPic').textContent=pic;$('#popupTitle').textContent=title;$('#popupText').textContent=text;$('#popupOverlay').classList.add('show')}
function closePopup(){$('#popupOverlay').classList.remove('show')}
$('#popupContinue').onclick=closePopup;$('#popupClose').onclick=closePopup;
function setModeLabel(){const labels={definition:'Definition → Word',word:'Word → Definition',context:'Sentence Challenge',synonym:'Synonyms',antonym:'Antonyms',mixed:'Mixed Test',missed:'Comeback Mode',readLearn:'Read & Learn',numberToWord:'Number → Spanish',wordToNumber:'Spanish → Number',pronunciation:'Pronunciation',spelling:'Spelling Check',visual:'Visual Count',spellingBuilder:'Spelling Builder',typeWord:'Type the Word'};$('#modeName').textContent=labels[state.mode]||state.mode;$('#setName').textContent=state.set==='english'?'English Vocabulary':'Spanish Numbers'}
function startMode(set,mode){state.set=set;state.mode=mode;state.idx=0;state.streak=0;state.roundCorrect=0;state.roundTotal=0;let pool;if(set==='english')pool=mode==='missed'?[...state.englishWrong]:englishVocab.map((_,i)=>i);else pool=mode==='missed'?[...state.spanishWrong]:spanishNumbers.map((_,i)=>i);if(!pool.length){popup('😺','Nothing to review','No missed items yet. That is a flex.');return}state.order=mode==='readLearn'?pool:shuffle(pool);const key=`${set}:${mode}`;state.analytics.modeRuns[key]=(state.analytics.modeRuns[key]||0)+1;state.analytics.lastActive=new Date().toISOString();showOnly('game');renderQuestion()}
function distract(pool,i,count=3){return shuffle(pool.map((_,j)=>j).filter(j=>j!==i)).slice(0,count)}
function misspell(word){const variants=new Set();const swaps={c:'k',s:'z',u:'o',i:'e',e:'i',v:'b'};for(let i=0;i<word.length;i++){if(swaps[word[i]])variants.add(word.slice(0,i)+swaps[word[i]]+word.slice(i+1));if(i<word.length-1)variants.add(word.slice(0,i)+word[i+1]+word[i]+word.slice(i+2))}variants.add(word+word.slice(-1));variants.delete(word);return [...variants].filter(x=>x.length>=2)}
function spellLetters(word){return word.toUpperCase().split('').join(' - ')}
function buildEnglish(i){const v=englishVocab[i];let m=state.mode==='mixed'?shuffle(['definition','word','context','synonym','antonym'])[0]:state.mode;if(m==='missed')m='definition';let label='',question='',answer='',options=[],visual='';if(m==='definition'){label='What word means…';question=v.def;answer=v.w;options=shuffle([v.w,...distract(englishVocab,i).map(j=>englishVocab[j].w)])}if(m==='word'){label='Choose the best definition';question=v.w;answer=v.def;options=shuffle([v.def,...distract(englishVocab,i).map(j=>englishVocab[j].def)])}if(m==='context'){label='Complete the sentence';question=v.sent.replace('___','□□□□');answer=v.w;options=shuffle([v.w,...distract(englishVocab,i).map(j=>englishVocab[j].w)])}if(m==='synonym'){label='Choose the closest meaning';question=`${v.w} is closest in meaning to…`;answer=v.syn[0];options=shuffle([answer,...shuffle(englishVocab.flatMap((x,j)=>j===i?[]:x.syn)).slice(0,3)])}if(m==='antonym'){label='Choose the opposite meaning';question=`Which choice is an antonym of ${v.w}?`;answer=v.ant[0];options=shuffle([answer,...shuffle(englishVocab.flatMap((x,j)=>j===i?[]:x.ant)).slice(0,3)])}return{i,kind:'choice',label,question,answer,options,visual,explain:`${v.w} = ${v.def}`}}
function buildSpanish(i){const v=spanishNumbers[i];let m=state.mode==='mixed'?shuffle(['numberToWord','wordToNumber','pronunciation','spelling','visual','spellingBuilder','typeWord'])[0]:state.mode;if(m==='missed')m='typeWord';let label='',question='',answer=v.w,options=[],visual='',kind='choice';if(m==='readLearn'){kind='study';label='Read it out loud';question='';answer=v.w}if(m==='numberToWord'){label='Choose the Spanish word';question=`How do you say ${v.n} in Spanish?`;options=shuffle([v.w,...distract(spanishNumbers,i).map(j=>spanishNumbers[j].w)])}if(m==='wordToNumber'){label='Choose the number';question=`What number is “${v.w}”?`;answer=String(v.n);options=shuffle([String(v.n),...distract(spanishNumbers,i).map(j=>String(spanishNumbers[j].n))])}if(m==='pronunciation'){label='Match the pronunciation';question=`Which word matches “${v.p}”?`;options=shuffle([v.w,...distract(spanishNumbers,i).map(j=>spanishNumbers[j].w)])}if(m==='spelling'){label='Spelling check';question=`Which spelling is correct for the Spanish word meaning ${v.n}?`;let wrong=shuffle(misspell(v.w));while(wrong.length<3)wrong.push(...distract(spanishNumbers,i).map(j=>spanishNumbers[j].w));options=shuffle([v.w,...wrong.filter(x=>x!==v.w).slice(0,3)])}if(m==='visual'){label='Visual count';const icons=['⭐','🍎','⚽','🐱','🎈'];visual=Array(v.n).fill(icons[i%icons.length]).join(' ');question='How many do you see? Choose the Spanish word.';options=shuffle([v.w,...distract(spanishNumbers,i).map(j=>spanishNumbers[j].w)])}if(m==='spellingBuilder'){kind='builder';label='Build the word';question=`Build the Spanish word for ${v.n}.`}if(m==='typeWord'){kind='type';label='Type the word';question=`Type the Spanish word for ${v.n}.`}return{i,kind,label,question,answer,options,visual,study:v,explain:`${v.n} = ${v.w} (${v.p})`,spelling:spellLetters(v.w)}}
function resetSpecialUI(){$('#studyCard').classList.add('hidden');$('#typeForm').classList.add('hidden');$('#builderArea').classList.add('hidden');$('#answers').classList.remove('hidden');$('#visualPrompt').classList.add('hidden');$('#next').textContent='Next question →';$('#typeInput').disabled=false}
function renderQuestion(){const i=state.order[state.idx],q=state.set==='english'?buildEnglish(i):buildSpanish(i);window.currentQ=q;document.body.dataset.locked='0';setModeLabel();$('#progressText').textContent=`${state.idx+1}/${state.order.length}`;$('#streak').textContent=state.streak;$('#bar').style.width=`${((state.idx+1)/state.order.length)*100}%`;$('#label').textContent=q.label;$('#question').textContent=q.question;$('#answers').innerHTML='';$('#feedback').classList.add('hidden');$('#next').classList.add('hidden');resetSpecialUI();if(q.visual){$('#visualPrompt').textContent=q.visual;$('#visualPrompt').classList.remove('hidden')}if(q.kind==='study'){const v=q.study;$('#answers').classList.add('hidden');$('#studyNumber').textContent=v.n;$('#studyWord').textContent=v.w;$('#studyPronunciation').textContent=v.p;$('#studySpelling').textContent=spellLetters(v.w);$('#studyCard').classList.remove('hidden');$('#next').textContent=state.idx===state.order.length-1?'Finish →':'Next card →';$('#next').classList.remove('hidden');return}if(q.kind==='type'){$('#answers').classList.add('hidden');$('#typeForm').classList.remove('hidden');$('#typeInput').value='';setTimeout(()=>$('#typeInput').focus(),50);return}if(q.kind==='builder'){$('#answers').classList.add('hidden');state.builderLetters=[];$('#builtWord').textContent='Tap letters below';$('#letterBank').innerHTML='';shuffle(q.answer.split('')).forEach((letter,pos)=>{const b=document.createElement('button');b.type='button';b.className='letter-chip';b.textContent=letter;b.dataset.pos=pos;b.onclick=()=>{b.disabled=true;state.builderLetters.push({letter,button:b});$('#builtWord').textContent=state.builderLetters.map(x=>x.letter).join('')}});$('#builderArea').classList.remove('hidden');return}q.options.forEach(opt=>{const b=document.createElement('button');b.className='answer';b.textContent=opt;b.onclick=()=>answerQuestion(opt,b);$('#answers').appendChild(b)})}
function track(i,correct){state.analytics.totalAnswered++;if(correct)state.analytics.totalCorrect++;state.analytics.lastActive=new Date().toISOString();state.analytics.bestStreak=Math.max(state.analytics.bestStreak,state.streak);if(state.set==='spanish'){const s=state.analytics.spanishStats[i]||{correct:0,wrong:0};correct?s.correct++:s.wrong++;state.analytics.spanishStats[i]=s}}
function spanishBreakdown(q){if(state.set!=='spanish')return'';const v=spanishNumbers[q.i];return `<div class="spelling-breakdown"><b>${v.n} = ${v.w}</b><div>${v.p}</div><div class="spell-letters">${spellLetters(v.w)}</div></div>`}
function finishAnswer(given,button){const q=window.currentQ;if(document.body.dataset.locked==='1')return;document.body.dataset.locked='1';const norm=x=>String(x).trim().toLowerCase();const correct=norm(given)===norm(q.answer);state.roundTotal++;if(correct){state.roundCorrect++;state.streak++;state.score+=100+(state.streak-1)*10;if(state.set==='english')state.englishWrong.delete(q.i);else state.spanishWrong.delete(q.i);track(q.i,true);if(button)button.classList.add('correct');$('#feedback').innerHTML=`<div class="reaction">😸 Purrfect</div><strong>Correct!</strong><br>${q.explain}${spanishBreakdown(q)}`;if([3,5,8].includes(state.streak))setTimeout(()=>popup('😼',`${state.streak} in a row!`,'Big brain cat mode activated.'),250)}else{state.streak=0;if(state.set==='english')state.englishWrong.add(q.i);else state.spanishWrong.add(q.i);track(q.i,false);if(button)button.classList.add('wrong');$$('.answer').forEach(b=>{if(norm(b.textContent)===norm(q.answer))b.classList.add('correct')});$('#feedback').innerHTML=`<div class="reaction">🙀 No drama</div><strong>Correct answer: ${q.answer}</strong><br>${q.explain}${spanishBreakdown(q)}`}$$('.answer').forEach(b=>b.disabled=true);$('#typeInput').disabled=true;$$('.letter-chip').forEach(b=>b.disabled=true);$('#feedback').classList.remove('hidden');$('#next').classList.remove('hidden');$('#streak').textContent=state.streak;updateHeader()}
function answerQuestion(opt,btn){finishAnswer(opt,btn)}
function nextQuestion(){state.idx++;if(state.idx>=state.order.length)finishRound();else renderQuestion()}
function finishRound(){queueCloudSync(true);showOnly('finish');const pct=state.roundTotal?Math.round(state.roundCorrect/state.roundTotal*100):100;$('#finishScore').textContent=state.mode==='readLearn'?'10 cards reviewed':`${state.roundCorrect} of ${state.roundTotal} correct • ${pct}%`;$('#finishEmoji').textContent=pct>=90?'🏆😻':pct>=75?'🔥😼':'🧠🐾';$('#finishMessage').textContent=state.mode==='readLearn'?'Nice. Now try Type the Word.':pct>=90?'Excellent. Cat-approved.':pct>=75?'Strong round. Run it once more.':'Good practice. Comeback Mode will help.'}
function renderSpanishStrip(){$('#spanishStudyStrip').innerHTML=spanishNumbers.map(x=>`<div class="mini-number"><b>${x.n} — ${x.w}</b><span>${x.p}</span></div>`).join('')}

function deviceToken(){try{return localStorage.getItem(DEVICE_TOKEN_KEY)||''}catch(e){return''}}
function updateCloudStatus(message,kind){
  const el=$('#cloudStatus'); if(!el) return;
  if(message){el.textContent=message;el.className='small '+(kind||'');return}
  if(!cloudClient){el.textContent='Cloud unavailable — local study still works.';el.className='small sync-bad';return}
  if(deviceToken()){
    const last=localStorage.getItem(LAST_CLOUD_SYNC_KEY);
    el.textContent=last?`Connected • last sync ${new Date(last).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`:'Connected • ready to sync';
    el.className='small sync-good';
    $('#connectDeviceBtn').textContent='Reconnect this device';
  }else{
    el.textContent='Local only • connect this computer for Parent cloud reports.';
    el.className='small sync-warn';
    $('#connectDeviceBtn').textContent='Connect this device';
  }
}
function queueCloudSync(immediate=false){
  if(!deviceToken()||!cloudClient)return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer=setTimeout(syncCloudProgress,immediate?0:500);
}
async function syncCloudProgress(){
  const token=deviceToken(); if(!token||!cloudClient)return;
  try{
    updateCloudStatus('Syncing…','sync-warn');
    const res=await fetch(`${SUPABASE_URL}/functions/v1/sync-study-progress`,{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY,'x-device-token':token},
      body:JSON.stringify({payload:localSnapshot()})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||'Cloud sync failed');
    localStorage.setItem(LAST_CLOUD_SYNC_KEY,data.updated_at||new Date().toISOString());
    updateCloudStatus();
  }catch(e){
    updateCloudStatus('Offline/local mode • results are safe on this device.','sync-warn');
  }
}
function openPairDevice(){
  $('#pairCodeInput').value='';$('#pairDeviceMessage').textContent='';
  $('#pairDeviceOverlay').classList.add('show');$('#pairDeviceOverlay').setAttribute('aria-hidden','false');
  setTimeout(()=>$('#pairCodeInput').focus(),50);
}
function closePairDevice(){$('#pairDeviceOverlay').classList.remove('show');$('#pairDeviceOverlay').setAttribute('aria-hidden','true')}
async function pairThisDevice(){
  const code=$('#pairCodeInput').value.replace(/\D/g,'');
  if(code.length!==8){$('#pairDeviceMessage').textContent='Enter the 8-digit code from Parent Mode.';return}
  $('#pairDeviceSubmit').disabled=true;$('#pairDeviceMessage').textContent='Connecting…';
  try{
    const res=await fetch(`${SUPABASE_URL}/functions/v1/pair-device`,{
      method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY},
      body:JSON.stringify({code})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.device_token)throw new Error(data.error||'Could not connect device');
    localStorage.setItem(DEVICE_TOKEN_KEY,data.device_token);
    $('#pairDeviceMessage').textContent='Connected ✓';
    updateCloudStatus();
    await syncCloudProgress();
    setTimeout(closePairDevice,650);
  }catch(e){$('#pairDeviceMessage').textContent=e.message||'Could not connect device'}
  finally{$('#pairDeviceSubmit').disabled=false}
}
function showParentPanel(which){
  ['parentAuth','parentGate','parentDashboard'].forEach(id=>$('#'+id).classList.toggle('hidden',id!==which));
}
async function openParent(){
  $('#parentOverlay').classList.add('show');$('#parentOverlay').setAttribute('aria-hidden','false');
  $('#parentPin').value='';$('#parentPinError').textContent='';$('#parentAuthMessage').textContent='';
  if(!cloudClient){showParentPanel('parentAuth');$('#parentAuthMessage').textContent='Cloud sign-in is unavailable right now.';return}
  const {data}=await cloudClient.auth.getSession();
  showParentPanel(data.session?'parentGate':'parentAuth');
  if(data.session)setTimeout(()=>$('#parentPin').focus(),50);
}
function closeParent(){$('#parentOverlay').classList.remove('show');$('#parentOverlay').setAttribute('aria-hidden','true')}
async function sendParentLink(){
  const email=$('#parentEmail').value.trim();
  if(!email||!email.includes('@')){$('#parentAuthMessage').textContent='Enter your email address.';return}
  $('#parentSendLink').disabled=true;$('#parentAuthMessage').textContent='Sending secure link…';
  try{
    const redirectTo=window.location.origin+window.location.pathname;
    const {error}=await cloudClient.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});
    if(error)throw error;
    $('#parentAuthMessage').textContent='Check your email and open the sign-in link on this device.';
  }catch(e){$('#parentAuthMessage').textContent=e.message||'Could not send sign-in link.'}
  finally{$('#parentSendLink').disabled=false}
}
function renderParentSnapshot(payload,updatedAt){
  const a=payload?.analytics||{totalAnswered:0,totalCorrect:0,bestStreak:0,modeRuns:{},spanishStats:Array.from({length:10},()=>({correct:0,wrong:0}))};
  if(!Array.isArray(a.spanishStats))a.spanishStats=Array.from({length:10},()=>({correct:0,wrong:0}));
  const acc=a.totalAnswered?Math.round((a.totalCorrect/a.totalAnswered)*100):0;
  const st=a.spanishStats.reduce((t,x)=>({c:t.c+(x.correct||0),w:t.w+(x.wrong||0)}),{c:0,w:0});
  const sacc=(st.c+st.w)?Math.round((st.c/(st.c+st.w))*100):0;
  $('#parentAccuracy').textContent=`${acc}%`;$('#parentAnswered').textContent=a.totalAnswered||0;$('#parentBestStreak').textContent=a.bestStreak||0;$('#parentSpanishAccuracy').textContent=`${sacc}%`;
  $('#parentLastActive').textContent=updatedAt?`Cloud sync: ${new Date(updatedAt).toLocaleString()}`:(a.lastActive?`Last activity: ${new Date(a.lastActive).toLocaleString()}`:'No cloud activity yet');
  $('#parentModes').innerHTML=Object.entries(a.modeRuns||{}).map(([k,v])=>`<span class="mode-chip">${k}: <b>${v}</b></span>`).join('')||'<span class="small">No practice recorded yet.</span>';
  $('#parentSpanishRows').innerHTML=spanishNumbers.map((x,i)=>{const s=a.spanishStats[i]||{correct:0,wrong:0},tot=(s.correct||0)+(s.wrong||0),p=tot?Math.round((s.correct||0)/tot*100):0;return `<tr><td><b>${x.w}</b></td><td>${x.n}</td><td>${s.correct||0}</td><td>${s.wrong||0}</td><td>${tot?p+'%':'—'}</td></tr>`}).join('');
}
async function loadParentCloudReport(){
  $('#parentCloudStatus').textContent='Loading cloud report…';
  try{
    const {data:student,error:studentError}=await cloudClient.from('students').select('id,display_name').maybeSingle();
    if(studentError)throw studentError;
    if(!student){renderParentSnapshot(null,null);$('#parentCloudStatus').textContent='No cloud profile yet. Generate a pairing code below first.';return}
    const {data:snapshot,error:snapshotError}=await cloudClient.from('study_snapshots').select('payload,updated_at').eq('student_id',student.id).maybeSingle();
    if(snapshotError)throw snapshotError;
    if(!snapshot){renderParentSnapshot(null,null);$('#parentCloudStatus').textContent='Sergio is connected, but no quiz results have synced yet.';return}
    renderParentSnapshot(snapshot.payload,snapshot.updated_at);$('#parentCloudStatus').textContent='Live from Supabase cloud ✓';
  }catch(e){$('#parentCloudStatus').textContent=e.message||'Could not load cloud report.'}
}
async function unlockParent(){
  if($('#parentPin').value!==PARENT_PIN){$('#parentPinError').textContent='Wrong PIN. Try again.';$('#parentPin').select();return}
  showParentPanel('parentDashboard');await loadParentCloudReport();
}
async function createParentPairCode(){
  $('#createPairCode').disabled=true;$('#parentPairCode').classList.remove('hidden');$('#parentPairCode').textContent='Generating…';
  try{
    const {data,error}=await cloudClient.functions.invoke('create-pairing-code',{body:{}});
    if(error)throw error;if(!data?.code)throw new Error(data?.error||'Could not generate code');
    $('#parentPairCode').innerHTML=`<div class="small">Enter this on Sergio’s computer within 10 minutes:</div><div class="pair-code-value">${data.code}</div><div class="small">Expires ${new Date(data.expires_at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</div>`;
    await loadParentCloudReport();
  }catch(e){$('#parentPairCode').textContent=e.message||'Could not generate pairing code.'}
  finally{$('#createPairCode').disabled=false}
}
async function parentSignOut(){if(cloudClient)await cloudClient.auth.signOut();closeParent()}
if(cloudClient){
  cloudClient.auth.onAuthStateChange((_event,session)=>{
    if($('#parentOverlay').classList.contains('show')&&session){showParentPanel('parentGate');setTimeout(()=>$('#parentPin').focus(),50)}
  });
}

function openComebackPicker(){
  $('#comebackOverlay').classList.add('show');
  $('#comebackOverlay').setAttribute('aria-hidden','false');
}
function closeComebackPicker(){
  $('#comebackOverlay').classList.remove('show');
  $('#comebackOverlay').setAttribute('aria-hidden','true');
}
function startQuickComeback(set){
  closeComebackPicker();
  startMode(set,'missed');
}
$('#comebackEnergyBtn').onclick=openComebackPicker;$('#comebackCancel').onclick=closeComebackPicker;$('#englishComebackQuick').onclick=()=>startQuickComeback('english');$('#spanishComebackQuick').onclick=()=>startQuickComeback('spanish');$('#comebackOverlay').addEventListener('click',e=>{if(e.target.id==='comebackOverlay')closeComebackPicker()});$$('.set-card').forEach(b=>b.onclick=()=>showSetMenu(b.dataset.set));$$('.backHub').forEach(b=>b.onclick=showHub);$$('.english-mode').forEach(b=>b.onclick=()=>startMode('english',b.dataset.mode));$$('.spanish-mode').forEach(b=>b.onclick=()=>startMode('spanish',b.dataset.spanishMode));$('#backToSet').onclick=()=>showSetMenu(state.set);$('#next').onclick=nextQuestion;$('#again').onclick=()=>startMode(state.set,state.mode);$('#chooseAnother').onclick=showHub;$('#typeForm').addEventListener('submit',e=>{e.preventDefault();finishAnswer($('#typeInput').value)});$('#builderClear').onclick=()=>{state.builderLetters.forEach(x=>x.button.disabled=false);state.builderLetters=[];$('#builtWord').textContent='Tap letters below'};$('#builderCheck').onclick=()=>finishAnswer(state.builderLetters.map(x=>x.letter).join(''));$('#connectDeviceBtn').onclick=openPairDevice;$('#pairDeviceCancel').onclick=closePairDevice;$('#pairDeviceSubmit').onclick=pairThisDevice;$('#pairCodeInput').addEventListener('keydown',e=>{if(e.key==='Enter')pairThisDevice()});$('#parentBtn').onclick=openParent;$('#parentAuthCancel').onclick=closeParent;$('#parentSendLink').onclick=sendParentLink;$('#parentCancel').onclick=closeParent;$('#parentClose').onclick=closeParent;$('#parentUnlock').onclick=unlockParent;$('#parentRefresh').onclick=loadParentCloudReport;$('#parentSignOut').onclick=parentSignOut;$('#createPairCode').onclick=createParentPairCode;$('#parentPin').addEventListener('keydown',e=>{if(e.key==='Enter')unlockParent()});renderSpanishStrip();load();updateHeader();showHub();