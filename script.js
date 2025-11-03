const questions = [
  { question: "Co oznacza skrót „3D” w nazwie „druk 3D”?", answers: ["Trzy drukarki", "Trzy wymiary", "Trzy dane"], correct: 1 },
  { question: "Kiedy powstały pierwsze technologie druku 3D?", answers: ["Lata 60.", "Lata 80.", "Lata 90."], correct: 1 },
  { question: "Najpopularniejsza technologia druku 3D dla amatorów to:", answers: ["SLA", "FDM", "SLS"], correct: 1 },
  { question: "Materiał roboczy w technologii FDM to:", answers: ["Filament z tworzywa sztucznego", "Proszek metalowy", "Ciekła żywica"], correct: 0 },
  { question: "Co robi tzw. slicer?", answers: ["Kroi model 3D na warstwy", "Kalibruje drukarkę", "Suszy filament"], correct: 0 },
  { question: "Jakie formaty plików stosuje się do druku 3D?", answers: ["STL i OBJ", "JPG i PNG", "PDF i DOCX"], correct: 0 },
  { question: "Jak nazywa się proces nakładania warstw?", answers: ["Frezowanie", "Depozycja warstwowa", "Fotopolimeryzacja"], correct: 1 },
  { question: "Który materiał jest biodegradowalny?", answers: ["ABS", "PLA", "PETG"], correct: 1 },
  { question: "Co oznacza skrót SLA?", answers: ["Stereolithography", "Standard Layer Application", "Sliced Layer Algorithm"], correct: 0 },
  { question: "Która technologia wykorzystuje laser do spiekania proszku?", answers: ["FDM", "SLS", "SLA"], correct: 1 },
  { question: "Proces wzmacniania wydruku to:", answers: ["Kompozytowanie", "Polimeryzacja", "Rekrystalizacja"], correct: 0 },
  { question: "Na gładkość powierzchni wpływa:", answers: ["Grubość warstwy", "Temperatura stołu", "Wysokość modelu"], correct: 0 },
  { question: "Co to jest raft?", answers: ["Wypełnienie wnętrza", "Podpórka pod wydruk", "Typ filamentu"], correct: 1 },
  { question: "Co powoduje stringing?", answers: ["Zbyt niska temperatura", "Zbyt wysoka temperatura ekstrudera", "Zbyt duża prędkość druku"], correct: 1 },
  { question: "W jakiej branży druk 3D stosuje się do protez?", answers: ["Motoryzacja", "Medycyna", "Architektura"], correct: 1 },
  { question: "Czy druk 3D może być używany w produkcji żywności?", answers: ["Tak", "Nie", "Tylko w kosmosie"], correct: 0 },
  { question: "Drukowanie budynków z betonu to:", answers: ["3D Construction Printing", "Macro FDM", "Additive Masonry"], correct: 0 },
  { question: "Który przedmiot NIE nadaje się do druku w FDM?", answers: ["Soczewka optyczna", "Uchwyt na narzędzia", "Obudowa do telefonu"], correct: 0 },
  { question: "Co to jest dual extrusion?", answers: ["Druk dwoma kolorami", "Druk dwóch modeli", "Drukarka z dwoma stołami"], correct: 0 },
  { question: "Które zastosowanie jest możliwe dzięki drukowi 3D?", answers: ["Druk organów z komórek", "Druk teleportów", "Druk samochodów z jednego materiału"], correct: 0 },
];

const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const resultContainer = document.getElementById("result");
const progress = document.getElementById("progress");
const progressText = document.getElementById("progress-text");

let currentQuestionIndex = 0;
let score = 0;

// Opcjonalnie: losuj kolejność pytań (odkomentuj jeśli chcesz)
// questions.sort(() => Math.random() - 0.5);

startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  questionContainer.classList.remove("hidden");
  startQuiz();
});

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  progress.max = questions.length;
  updateProgress();
  showQuestion();
  nextButton.classList.add("hidden");
  resultContainer.classList.add("hidden");
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

  currentQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.classList.add("btn");
    button.addEventListener("click", () => selectAnswer(index));
    answerButtons.appendChild(button);
  });
}

function resetState() {
  nextButton.classList.add("hidden");
  answerButtons.innerHTML = "";
}

function selectAnswer(selectedIndex) {
  const correctIndex = questions[currentQuestionIndex].correct;
  const buttons = Array.from(answerButtons.querySelectorAll(".btn"));

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === correctIndex) {
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "#000";
    } else if (index === selectedIndex) {
      button.style.backgroundColor = "#E53935";
      button.style.color = "#fff";
    }
  });

  if (selectedIndex === correctIndex) score++;
  nextButton.classList.remove("hidden");
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
    updateProgress();
  } else {
    showResult();
  }
});

function updateProgress() {
  progress.value = currentQuestionIndex;
  progressText.textContent = `${currentQuestionIndex} / ${questions.length}`;
}

function showResult() {
  questionContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  resultContainer.textContent = `Twój wynik: ${score} / ${questions.length}`;
  // Dodaj przycisk do powtórzenia
  const retryBtn = document.createElement("button");
  retryBtn.textContent = "Zagraj ponownie";
  retryBtn.classList.add("btn");
  retryBtn.addEventListener("click", () => {
    startScreen.classList.remove("hidden");
    resultContainer.classList.add("hidden");
  });
  resultContainer.appendChild(document.createElement("br"));
  resultContainer.appendChild(retryBtn);
}
