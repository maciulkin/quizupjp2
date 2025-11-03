// Professional, minimal, accessible quiz logic
// - losowanie pytań i odpowiedzi
// - obsługa keyboard (1/2/3 wybór + Enter dalej)
// - generowanie pobranego wyniku (TXT)
// - zero dźwięków

const QUESTIONS = [
  { q: "Co oznacza skrót '3D' w kontekście druku 3D?", a: ["Trzy drukarki", "Trzy wymiary", "Trzy procesy"], correct: 1 },
  { q: "Która technologia jest najczęściej używana w drukarkach hobbystycznych?", a: ["FDM", "SLS", "SLA"], correct: 0 },
  { q: "Jaki materiał jest biodegradowalny i często stosowany w FDM?", a: ["ABS", "PLA", "Nylon"], correct: 1 },
  { q: "Co robi program zwany 'slicer'?", a: ["Zamienia model 3D na warstwy i instrukcje dla drukarki", "Naprawia model 3D automatycznie", "Tworzy tekstury do modelu"], correct: 0 },
  { q: "Która metoda używa ciekłej żywicy utwardzanej światłem?", a: ["SLA / DLP", "SLS", "FDM"], correct: 0 },
  { q: "Co to jest 'raft' w ustawieniach druku?", a: ["Twarda sklejka pod stołem", "Podkładka ułatwiająca adhezję pierwszej warstwy", "Typ filamentu"], correct: 1 },
  { q: "Który parametr ma największy wpływ na widoczność linii warstw?", a: ["Grubość warstwy", "Temperatura pokojowa", "Prędkość sieci Wi-Fi"], correct: 0 },
  { q: "Technologia SLS wykorzystuje:", a: ["Strumień topiący filament", "Laser spiekający proszek", "Światło LCD utwardzające żywicę"], correct: 1 },
  { q: "Jaka jest przewaga stosowania kompozytów (np. włókno węglowe) w filamentach?", a: ["Tańszy druk", "Większa wytrzymałość i sztywność", "Lepsze kolory"], correct: 1 },
  { q: "Co to jest 'stringing' i jak się go unika?", a: ["Nitkowanie między punktami — obniżenie temperatury i retrakcja", "Pękanie wydruku — większa prędkość", "Osadzanie kurzu — czyszczenie stołu"], correct: 0 },
  { q: "Który format pliku jest standardem do wymiany modeli 3D do druku?", a: ["STL", "PNG", "CSV"], correct: 0 },
  { q: "Jakie zastosowanie medyczne ma druk 3D?", a: ["Tworzenie protez i modeli anatomicznych", "Tylko dekoracje sal operacyjnych", "Produkcja leków bez kontroli"], correct: 0 },
  { q: "Czym różni się infill od shell w druku FDM?", a: ["Infill to wypełnienie wnętrza, shell to zewnętrzne ścianki", "Infill to temperatura, shell to prędkość", "To synonimy"], correct: 0 },
  { q: "Co to znaczy 'dual extrusion'?", a: ["Druk dwoma materiałami lub kolorami w jednym wydruku", "Druk dwoma drukarkami równocześnie", "Dwukrotne wygrzewanie stołu"], correct: 0 },
  { q: "Który z elementów NIE nadaje się łatwo do druku FDM bez dodatkowej obróbki?", a: ["Uchwyt na narzędzia", "Soczewka optyczna wymagająca klarowności i dokładności", "Obudowa telefonu"], correct: 1 },
  { q: "Jak poprawić adhezję pierwszej warstwy?", a: ["Obniżyć temperaturę stołu", "Wyrównać oraz podgrzać stół i stosować klej/płytkę PEI", "Używać tylko filamentu ABS"], correct: 1 },
  { q: "Który materiał jest odporny na wysokie temperatury i powszechnie używany w przemyśle?", a: ["PETG", "PLA", "PEEK"], correct: 2 },
  { q: "Co oznacza termin 'post-processing' w kontekście druku 3D?", a: ["Czyszczenie i wykończenie wydruku (szlif, malowanie, piaskowanie)", "Konfiguracja slicera", "Drukowanie drugiego egzemplarza"], correct: 0 },
  { q: "Kiedy warto stosować podpórki (supports)?", a: ["Gdy model ma elementy wiszące i przewieszki", "Zawsze, niezależnie od geometrii", "Tylko przy metalu"], correct: 0 },
  { q: "Co jest najważniejsze przy projektowaniu modelu do druku 3D?", a: ["Estetyka w 3ds Max", "Ustalanie tolerancji, grubości ścian i orientacji druku", "Używanie jak najwięcej cienkich ścian"], correct: 1 }
];

// ---- Helpers ----
function shuffle(array){
  // Fisher–Yates
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function copyAndShuffleAnswers(question){
  // returns {answers: [...], correctIndex: n}
  const originals = question.a.map((text, idx) => ({text, idx}));
  shuffle(originals);
  const answers = originals.map(x => x.text);
  const correctIndex = originals.findIndex(x => x.idx === question.correct);
  return {answers, correctIndex};
}

// ---- DOM ----
const startBtn = document.getElementById('start-btn');
const rulesBtn = document.getElementById('rules-btn');
const startScreen = document.getElementById('start-screen');
const quizCard = document.getElementById('quiz-card');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const quitBtn = document.getElementById('quit-btn');
const progressEl = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const resultCard = document.getElementById('result-card');
const resultSummary = document.getElementById('result-summary');
const retryBtn = document.getElementById('retry-btn');
const downloadBtn = document.getElementById('download-btn');
const rulesModal = document.getElementById('rules-modal');
const closeRules = document.getElementById('close-rules');

let order; // array of indices for QUESTIONS
let pool;  // array of objects {qIndex, answers[], correctIndex}
let current = 0;
let score = 0;
let lastSelected = null;

// --- UI helpers ---
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function setProgress(){
  progressEl.max = pool.length;
  progressEl.value = current;
  progressText.textContent = `${current} / ${pool.length}`;
}
function createAnswerButton(text, idx){
  const btn = document.createElement('button');
  btn.className = 'answer';
  btn.setAttribute('role','listitem');
  btn.type = 'button';
  btn.textContent = text;
  btn.dataset.index = idx;
  btn.setAttribute('aria-checked','false');
  btn.tabIndex = 0;
  return btn;
}

// --- Render question ---
function renderQuestion(){
  lastSelected = null;
  nextBtn.classList.add('hidden');
  answersEl.innerHTML = '';
  const item = pool[current];
  questionEl.textContent = `${current+1}. ${QUESTIONS[item.qIndex].q}`;

  item.answers.forEach((ans, i) => {
    const btn = createAnswerButton(ans, i);
    btn.addEventListener('click', () => onSelect(i, btn));
    answersEl.appendChild(btn);
  });

  setProgress();
  // subtle fade-in
  quizCard.animate([{opacity:0, transform:'translateY(6px)'},{opacity:1, transform:'translateY(0)'}], {duration:220, easing:'ease-out'});
}

// --- selection handler ---
function onSelect(selected, button){
  if (lastSelected !== null) return; // lock once chosen
  lastSelected = selected;

  const correctIndex = pool[current].correctIndex;
  const buttons = Array.from(answersEl.querySelectorAll('.answer'));

  buttons.forEach((b, i) => {
    b.disabled = true;
    b.setAttribute('aria-checked','false');
    if (i === correctIndex){
      b.classList.add('correct');
      b.setAttribute('aria-checked','true');
    }
    if (i === selected && i !== correctIndex){
      b.classList.add('wrong');
      b.setAttribute('aria-checked','false');
    }
  });

  if (selected === correctIndex) score++;
  // show next
  nextBtn.classList.remove('hidden');
  nextBtn.focus();
}

// --- next ---
function onNext(){
  current++;
  if (current < pool.length){
    renderQuestion();
  } else {
    showResults();
  }
}

// --- show results ---
function showResults(){
  hide(quizCard);
  show(resultCard);

  const percent = Math.round((score / pool.length) * 100);
  const titleText = `Twój wynik: ${score} / ${pool.length} (${percent}%)`;

  resultSummary.innerHTML = '';
  const scoreEl = document.createElement('div');
  scoreEl.className = 'result-score';
  scoreEl.textContent = titleText;

  const msgEl = document.createElement('div');
  msgEl.className = 'result-msg';
  let msg = 'Spróbuj ponownie, aby poprawić wynik.';
  if (percent >= 90) msg = 'Świetnie — poziom ekspercki!';
  else if (percent >= 75) msg = 'Bardzo dobrze!';
  else if (percent >= 50) msg = 'Dobrze — trochę ćwiczeń i będzie świetnie.';

  msgEl.textContent = msg;

  // small progress visual: recreate a progress bar element
  const visual = document.createElement('div');
  visual.style.width = '100%';
  visual.style.maxWidth = '420px';
  visual.style.background = 'rgba(255,255,255,0.04)';
  visual.style.borderRadius = '10px';
  visual.style.padding = '6px';
  const inner = document.createElement('div');
  inner.style.height = '12px';
  inner.style.borderRadius = '8px';
  inner.style.background = 'linear-gradient(90deg,var(--gold), #f1d86b)';
  inner.style.width = percent + '%';
  inner.style.boxShadow = 'inset 0 -2px 8px rgba(0,0,0,0.35)';
  visual.appendChild(inner);

  resultSummary.appendChild(scoreEl);
  resultSummary.appendChild(msgEl);
  resultSummary.appendChild(visual);
}

// --- start quiz ---
function startQuiz(){
  // prepare order and pool
  order = Array.from(QUESTIONS.keys());
  shuffle(order);
  pool = order.slice(0, QUESTIONS.length).map(i => {
    const {answers, correctIndex} = copyAndShuffleAnswers(QUESTIONS[i]);
    return { qIndex: i, answers, correctIndex };
  });
  current = 0;
  score = 0;

  hide(startScreen);
  hide(resultCard);
  show(quizCard);
  renderQuestion();
}

// --- download result (simple TXT) ---
function downloadResult(){
  const lines = [
    `Quiz: Druk 3D — UPJP2`,
    `Wynik: ${score} / ${pool.length}`,
    `Procent: ${Math.round((score/pool.length)*100)}%`,
    `Data: ${new Date().toLocaleString()}`,
    '',
    '--- Pytania i udzielone odpowiedzi ---'
  ];
  // We don't track selected answers per question for simplicity; could be extended.
  const blob = new Blob(lines, {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wynik_quiz_3d_${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- keyboard shortcuts (1/2/3 and Enter for next) ---
document.addEventListener('keydown', (e) => {
  if (quizCard.classList.contains('hidden')) return;
  const key = e.key;
  if (['1','2','3'].includes(key)){
    const idx = parseInt(key,10) - 1;
    const btn = answersEl.querySelector(`.answer[data-index="${idx}"]`);
    if (btn) btn.click();
  } else if (key === 'Enter' && !nextBtn.classList.contains('hidden')){
    onNext();
  }
});

// --- events ---
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', onNext);
retryBtn.addEventListener('click', () => {
  hide(resultCard);
  show(startScreen);
});
downloadBtn.addEventListener('click', downloadResult);
quitBtn.addEventListener('click', () => {
  if (confirm('Na pewno zakończyć quiz? Wynik nie zostanie zapisany.')) {
    hide(quizCard);
    show(startScreen);
  }
});
rulesBtn.addEventListener('click', () => show(rulesModal));
closeRules.addEventListener('click', () => hide(rulesModal));

// --- utilities placed here to avoid hoisting surprises ----
function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function copyAndShuffleAnswers(question){
  const originals = question.a.map((text, idx) => ({text, idx}));
  shuffle(originals);
  const answers = originals.map(x => x.text);
  const correctIndex = originals.findIndex(x => x.idx === question.correct);
  return {answers, correctIndex};
}
