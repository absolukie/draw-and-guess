const WORDS = {
  "🍕 Food & Drink": ["pizza","sushi","taco","spaghetti","hamburger","pancake","ice cream","donut","sandwich","popcorn","watermelon","banana","strawberry","pineapple","coffee","cupcake","cheese","fried egg","bacon","hot dog","fries","salad","soup","cake","cookie","bread","apple","grapes","carrot","avocado"],
  "🐶 Animals": ["dog","cat","elephant","lion","tiger","monkey","giraffe","zebra","kangaroo","penguin","fish","shark","octopus","butterfly","bee","spider","snake","frog","rabbit","horse","cow","pig","chicken","duck","owl","bear","fox","deer","mouse","whale"],
  "🏠 Everyday": ["chair","table","lamp","phone","book","key","umbrella","shoe","hat","glasses","clock","mirror","candle","pillow","toothbrush","scissors","guitar","camera","bicycle","car","airplane","boat","train","house","door","window","bed","sofa","wallet","backpack"],
  "🏃 Actions": ["running","swimming","dancing","singing","cooking","reading","writing","driving","flying","climbing","jumping","sleeping","eating","laughing","crying","painting","skiing","surfing","fishing","hiking","shopping","cleaning","brushing teeth","waving","clapping","sneezing","yawning","texting","juggling","yoga"]
};

const state = {
  names: ["Luke", "Gabrielle"],
  rounds: 6,
  timeLimit: 60,
  cats: [],
  deck: [],
  round: 0,
  drawer: 0,
  scores: [0, 0],
  word: "",
  wordCat: "",
  timerId: null,
  timeLeft: 0,
};

const $ = (id) => document.getElementById(id);
const screens = ["screen-setup","screen-reveal","screen-draw","screen-result","screen-over"];
function show(id) {
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  window.scrollTo(0, 0);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- setup ---------- */
function buildCatChecks() {
  const box = $("cat-checks");
  Object.keys(WORDS).forEach((cat, i) => {
    const lab = document.createElement("label");
    lab.className = "check" + (i < 2 ? " sel" : "");
    lab.innerHTML = `<input type="checkbox"${i < 2 ? " checked" : ""}> ${cat}`;
    lab.querySelector("input").addEventListener("change", (e) => {
      lab.classList.toggle("sel", e.target.checked);
    });
    box.appendChild(lab);
  });
}
function pillGroup(id, cb) {
  const el = $(id);
  el.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    el.querySelectorAll("button").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
    cb(parseInt(b.dataset.v, 10));
  });
}

$("btn-start").addEventListener("click", () => {
  const n1 = $("name1").value.trim(), n2 = $("name2").value.trim();
  state.names = [n1 || "Player 1", n2 || "Player 2"];
  state.cats = [...$("cat-checks").querySelectorAll("label")]
    .filter(l => l.querySelector("input").checked)
    .map(l => l.textContent.trim());
  if (!state.cats.length) state.cats = Object.keys(WORDS);
  state.round = 0;
  state.drawer = Math.floor(Math.random() * 2); // random first drawer
  state.scores = [0, 0];
  buildDeck();
  startReveal();
});

function buildDeck() {
  let pool = [];
  state.cats.forEach(c => WORDS[c].forEach(w => pool.push({ w, c })));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  state.deck = pool;
}
function drawWord() {
  if (!state.deck.length) buildDeck();
  const { w, c } = state.deck.pop();
  state.word = w; state.wordCat = c;
}

/* ---------- reveal ---------- */
function startReveal() {
  state.round++;
  drawWord();
  $("reveal-drawer").textContent = state.names[state.drawer];
  $("reveal-hidden").classList.remove("hidden");
  $("reveal-shown").classList.add("hidden");
  show("screen-reveal");
}
$("btn-reveal").addEventListener("click", () => {
  $("reveal-cat").textContent = state.wordCat;
  $("reveal-word").textContent = cap(state.word);
  $("reveal-hidden").classList.add("hidden");
  $("reveal-shown").classList.remove("hidden");
});
$("btn-draw-start").addEventListener("click", startDraw);

/* ---------- drawing ---------- */
const canvas = $("canvas"), ctx = canvas.getContext("2d");
let drawing = false, last = null, undoStack = [];
let curColor = "#1a1a1a", curSize = 9;

function sizeCanvas() {
  const wrap = $("canvas-wrap");
  const r = wrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.max(50, r.width * dpr);
  canvas.height = Math.max(50, r.height * dpr);
  canvas.style.width = r.width + "px";
  canvas.style.height = r.height + "px";
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
}
function snapshot() {
  try {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > 25) undoStack.shift();
  } catch (e) {}
}
function pos(e) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
}
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  snapshot();
  drawing = true; last = pos(e);
  canvas.setPointerCapture(e.pointerId);
  dot(last);
});
canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  e.preventDefault();
  const p = pos(e);
  ctx.strokeStyle = curColor; ctx.lineWidth = curSize * (Math.min(window.devicePixelRatio || 1, 3));
  ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
  last = p;
});
const stopDraw = () => { drawing = false; };
canvas.addEventListener("pointerup", stopDraw);
canvas.addEventListener("pointercancel", stopDraw);
function dot(p) {
  ctx.fillStyle = curColor;
  ctx.beginPath(); ctx.arc(p.x, p.y, curSize * (Math.min(window.devicePixelRatio || 1, 3)) / 2, 0, 7); ctx.fill();
}

const COLORS = ["#1a1a1a","#e53e3e","#dd6b20","#d69e2e","#38a169","#3182ce","#805ad5","#d53f8c","#4a3728","#ffffff"];
function buildColors() {
  const box = $("colors");
  COLORS.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "swatch" + (i === 0 ? " sel" : "") + (c === "#ffffff" ? " eraser" : "");
    b.style.background = c;
    b.title = c === "#ffffff" ? "Eraser" : c;
    b.addEventListener("click", () => {
      curColor = c;
      box.querySelectorAll(".swatch").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
    });
    box.appendChild(b);
  });
}
$("sizes").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  curSize = parseInt(b.dataset.s, 10);
  $("sizes").querySelectorAll("button").forEach(x => x.classList.remove("sel"));
  b.classList.add("sel");
});
$("btn-undo").addEventListener("click", () => {
  const img = undoStack.pop();
  if (img) ctx.putImageData(img, 0, 0);
});
$("btn-clear").addEventListener("click", () => {
  snapshot();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

/* ---------- round flow ---------- */
function startDraw() {
  show("screen-draw");
  requestAnimationFrame(() => {
    sizeCanvas();
    $("draw-round").textContent = `Round ${state.round}/${state.rounds}`;
    $("draw-word").textContent = cap(state.word);
    $("draw-cat").textContent = state.wordCat;
    updateScores();
    state.timeLeft = state.timeLimit;
    tick();
    clearInterval(state.timerId);
    state.timerId = setInterval(tick, 200);
  });
}
function updateScores() {
  $("draw-scores").textContent = `${state.scores[0]} – ${state.scores[1]}`;
}
function tick() {
  state.timeLeft = Math.max(0, state.timeLeft - 0.2);
  $("timer-num").textContent = Math.ceil(state.timeLeft);
  $("timer-bar").style.width = (100 * state.timeLeft / state.timeLimit) + "%";
  $("timer-bar").classList.toggle("low", state.timeLeft <= 10);
  if (state.timeLeft <= 0) endRound(false);
}
function endRound(guessed) {
  clearInterval(state.timerId);
  if (guessed) state.scores[state.drawer]++;
  const lastRound = state.round >= state.rounds;
  if (lastRound) {
    gameOver();
  } else {
    $("result-emoji").textContent = guessed ? "🎉" : "⏰";
    $("result-title").textContent = guessed
      ? `Point for ${state.names[state.drawer]}!`
      : "Time's up!";
    $("result-sub").textContent = guessed
      ? `Nice drawing — "${cap(state.word)}" it was.`
      : `The word was "${cap(state.word)}". No point this time.`;
    $("btn-next").textContent = `Next: ${state.names[1 - state.drawer]} draws →`;
    show("screen-result");
  }
}
$("btn-gotit").addEventListener("click", () => endRound(true));
$("btn-skip").addEventListener("click", () => endRound(false));
$("btn-next").addEventListener("click", () => {
  state.drawer = 1 - state.drawer;
  startReveal();
});

/* ---------- game over ---------- */
function gameOver() {
  const [a, b] = state.scores;
  const [n1, n2] = state.names;
  $("over-title").textContent =
    a === b ? "It's a tie! 🤝" : `${a > b ? n1 : n2} wins!`;
  $("over-scores").innerHTML =
    `<div class="frow"><span>${n1}</span><b>${a}</b></div>` +
    `<div class="frow"><span>${n2}</span><b>${b}</b></div>`;
  show("screen-over");
}
$("btn-again").addEventListener("click", () => {
  state.round = 0; state.scores = [0, 0];
  state.drawer = Math.floor(Math.random() * 2);
  buildDeck();
  startReveal();
});
$("btn-new").addEventListener("click", () => show("screen-setup"));

/* ---------- init ---------- */
buildCatChecks();
buildColors();
pillGroup("rounds-pills", v => state.rounds = v);
pillGroup("time-pills", v => state.timeLimit = v);
window.addEventListener("resize", () => {
  if ($("screen-draw").classList.contains("active")) sizeCanvas();
});
