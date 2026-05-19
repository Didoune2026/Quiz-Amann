import { useState, useEffect, useRef, useCallback } from "react";

const TIMER_MAX = 15;
const LETTERS   = ["A","B","C","D"];

function pickQuestions(db) {
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const facile  = shuffle(db.filter(q => q.difficulte === "facile")).slice(0, 5);
  const moyen   = shuffle(db.filter(q => q.difficulte === "moyen")).slice(0, 10);
  const diff    = shuffle(db.filter(q => q.difficulte === "difficile")).slice(0, 5);
  return shuffle([...facile, ...moyen, ...diff]);
}

function calcScore(points, timeLeft) {
  return points + (timeLeft / TIMER_MAX) * 1;
}

const makeStyles = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${dark?"#1a2340":"#f5f2eb"}; color: ${dark?"#dde4f0":"#1a1a1a"}; font-family:'DM Sans',sans-serif; min-height:100vh; transition:background 0.3s,color 0.3s; }
  .app { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px 16px; }
  .card { width:100%; max-width:680px; background:${dark?"#243058":"#ffffff"}; border:2px solid ${dark?"#344070":"#1a1a1a"}; border-radius:6px; padding:40px; box-shadow:${dark?"6px 6px 0 #111828":"6px 6px 0 #1a1a1a"}; transition:background 0.3s,border-color 0.3s; }

  .settings-btn { position:fixed; top:16px; right:16px; width:40px; height:40px; background:${dark?"#344070":"#fff"}; border:1.5px solid ${dark?"#3e508a":"#ccc"}; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:100; color:${dark?"#8898c8":"#666"}; font-size:18px; transition:all 0.15s; }
  .settings-btn:hover { border-color:#e8400c; color:#e8400c; }
  .settings-panel { position:fixed; top:64px; right:16px; background:${dark?"#243058":"#fff"}; border:1.5px solid ${dark?"#344070":"#ddd"}; border-radius:6px; padding:20px 24px; z-index:99; min-width:200px; box-shadow:${dark?"4px 4px 0 #111828":"4px 4px 0 #1a1a1a"}; animation:fadeIn 0.15s ease; }
  .settings-title { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; color:${dark?"#7888b8":"#888"}; margin-bottom:16px; }
  .toggle-row { display:flex; align-items:center; justify-content:space-between; gap:16px; font-size:14px; color:${dark?"#aab4d8":"#444"}; font-weight:500; }
  .toggle { position:relative; width:44px; height:24px; flex-shrink:0; }
  .toggle input { opacity:0; width:0; height:0; }
  .toggle-slider { position:absolute; inset:0; background:${dark?"#3e508a":"#ddd"}; border-radius:24px; cursor:pointer; transition:background 0.2s; }
  .toggle-slider::before { content:''; position:absolute; height:18px; width:18px; left:3px; top:3px; background:white; border-radius:50%; transition:transform 0.2s; }
  .toggle input:checked + .toggle-slider { background:#e8400c; }
  .toggle input:checked + .toggle-slider::before { transform:translateX(20px); }

  .home-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(64px,14vw,108px); line-height:0.88; letter-spacing:3px; color:${dark?"#e8400c":"#1a1a1a"}; margin-bottom:6px; }
  .home-sub { font-size:12px; letter-spacing:3px; text-transform:uppercase; color:${dark?"#6880b8":"#888"}; margin-bottom:40px; }
  .home-rules { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:40px; }
  .rule-item { background:${dark?"#1a2340":"#f5f2eb"}; border:1.5px solid ${dark?"#344070":"#ddd"}; border-radius:4px; padding:14px 16px; font-size:13px; color:${dark?"#8898c8":"#555"}; }
  .rule-item strong { display:block; font-family:'Bebas Neue',sans-serif; font-size:28px; color:#e8400c; letter-spacing:1px; margin-bottom:1px; }

  .btn-primary { width:100%; padding:18px; background:#e8400c; color:#fff; font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:3px; border:2px solid ${dark?"#e8400c":"#1a1a1a"}; border-radius:4px; cursor:pointer; transition:all 0.12s; box-shadow:3px 3px 0 ${dark?"#7a1a00":"#1a1a1a"}; }
  .btn-primary:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0 ${dark?"#7a1a00":"#1a1a1a"}; }
  .btn-primary:active { transform:translate(1px,1px); box-shadow:2px 2px 0 ${dark?"#7a1a00":"#1a1a1a"}; }
  .btn-primary:disabled { opacity:0.5; cursor:default; transform:none; }
  .btn-secondary { padding:12px 24px; background:transparent; color:${dark?"#777":"#444"}; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; border:1.5px solid ${dark?"#3e508a":"#bbb"}; border-radius:4px; cursor:pointer; transition:all 0.12s; }
  .btn-secondary:hover { border-color:#e8400c; color:#e8400c; }

  .quiz-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .q-counter { font-family:'Bebas Neue',sans-serif; font-size:36px; color:${dark?"#dde4f0":"#1a1a1a"}; letter-spacing:1px; }
  .q-counter span { font-size:18px; color:${dark?"#6880b8":"#999"}; }
  .q-score-live { font-family:'Bebas Neue',sans-serif; font-size:22px; color:${dark?"#6880b8":"#999"}; letter-spacing:1px; }
  .categorie-badge { display:inline-block; font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#fff; background:#e8400c; border-radius:3px; padding:4px 12px; }

  .timer-bar-wrap { height:6px; background:${dark?"#1e2d50":"#eee"}; border-radius:3px; margin-bottom:28px; overflow:hidden; border:1px solid ${dark?"#344070":"#ddd"}; }
  .timer-bar { height:100%; border-radius:3px; transition:width 0.1s linear,background-color 0.3s; }
  .timer-digits { font-family:'Bebas Neue',sans-serif; font-size:52px; letter-spacing:2px; transition:color 0.3s; text-align:right; line-height:1; margin-bottom:6px; }
  .question-text { font-size:clamp(17px,3vw,21px); font-weight:600; line-height:1.4; color:${dark?"#dde4f0":"#1a1a1a"}; margin-bottom:24px; min-height:64px; }

  .answers { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .answer-btn { display:flex; align-items:flex-start; gap:10px; padding:14px 16px; background:${dark?"#1a2340":"#f9f8f5"}; border:1.5px solid ${dark?"#344070":"#ccc"}; border-radius:4px; color:${dark?"#dde4f0":"#222"}; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; text-align:left; cursor:pointer; transition:all 0.12s; line-height:1.35; }
  .answer-btn:not(.disabled):hover { background:${dark?"#1e2d50":"#fff5e6"}; border-color:#e8400c; color:${dark?"#fff":"#1a1a1a"}; }
  .answer-btn .letter { font-family:'Bebas Neue',sans-serif; font-size:18px; color:#e8400c; min-width:18px; line-height:1.2; flex-shrink:0; }
  .answer-btn.correct { background:${dark?"#0d2b1e":"#edfaf1"}; border-color:#27ae60; color:${dark?"#5fd98a":"#1a6635"}; }
  .answer-btn.correct .letter { color:#27ae60; }
  .answer-btn.wrong { background:${dark?"#3a1520":"#fdf0ee"}; border-color:#e8400c; color:${dark?"#ff7060":"#c0391a"}; }
  .answer-btn.wrong .letter { color:#e8400c; }
  .answer-btn.disabled { cursor:default; pointer-events:none; }

  .feedback-bar { margin-top:16px; padding:12px 16px; border-radius:4px; font-size:14px; font-weight:600; text-align:center; animation:fadeIn 0.2s ease; }
  .feedback-bar.correct { background:${dark?"#0d2b1e":"#edfaf1"}; color:${dark?"#5fd98a":"#1a6635"}; border:1.5px solid #27ae60; }
  .feedback-bar.wrong   { background:${dark?"#3a1520":"#fdf0ee"}; color:${dark?"#ff7060":"#c0391a"}; border:1.5px solid #e8400c; }
  .feedback-bar.timeout { background:${dark?"#2a2012":"#fff8e6"}; color:${dark?"#f0b030":"#b07800"}; border:1.5px solid #f0a800; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

  .result-score { font-family:'Bebas Neue',sans-serif; font-size:clamp(72px,18vw,120px); line-height:0.88; color:#e8400c; margin:12px 0 4px; }
  .result-label { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:${dark?"#6880b8":"#999"}; margin-bottom:6px; }
  .result-details { font-size:14px; color:${dark?"#6880b8":"#777"}; margin-bottom:32px; }
  .result-details span { color:${dark?"#dde4f0":"#1a1a1a"}; font-weight:600; }

  .hof-form { margin-bottom:32px; }
  .hof-form p { font-size:13px; color:${dark?"#6880b8":"#666"}; margin-bottom:10px; font-weight:500; }
  .hof-input-row { display:flex; gap:10px; }
  .hof-input { flex:1; padding:13px 16px; background:${dark?"#1a2340":"#f9f8f5"}; border:1.5px solid ${dark?"#344070":"#ccc"}; border-radius:4px; color:${dark?"#dde4f0":"#1a1a1a"}; font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color 0.15s; }
  .hof-input:focus { border-color:#e8400c; }
  .hof-input::placeholder { color:${dark?"#445588":"#bbb"}; }
  .btn-submit { padding:13px 24px; background:#e8400c; color:#fff; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:1px; border:2px solid ${dark?"#e8400c":"#1a1a1a"}; border-radius:4px; cursor:pointer; transition:all 0.12s; white-space:nowrap; box-shadow:2px 2px 0 ${dark?"#7a1a00":"#1a1a1a"}; }
  .btn-submit:hover { transform:translate(-1px,-1px); box-shadow:3px 3px 0 ${dark?"#7a1a00":"#1a1a1a"}; }
  .btn-submit:disabled { opacity:0.35; cursor:default; transform:none; box-shadow:none; }

  .hof-title { font-family:'Bebas Neue',sans-serif; font-size:30px; letter-spacing:3px; color:${dark?"#444":"#444"}; margin-bottom:14px; }
  .hof-list { list-style:none; }
  .hof-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid ${dark?"#1e2d50":"#eee"}; font-size:14px; animation:slideIn 0.3s ease backwards; }
  @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  .hof-rank { font-family:'Bebas Neue',sans-serif; font-size:22px; min-width:28px; color:${dark?"#445588":"#ccc"}; }
  .hof-rank.gold{color:#e8a000} .hof-rank.silver{color:#888} .hof-rank.bronze{color:#b87333}
  .hof-name { flex:1; color:${dark?"#aab4d8":"#333"}; font-weight:500; }
  .hof-name.me { color:#e8400c; font-weight:700; }
  .hof-pts { font-family:'Bebas Neue',sans-serif; font-size:22px; color:${dark?"#5570a8":"#999"}; }
  .hof-pts.me { color:#e8400c; }
  .hof-time { font-size:11px; color:${dark?"#445588":"#bbb"}; min-width:60px; text-align:right; }
  .hof-empty { font-size:13px; color:${dark?"#445588":"#bbb"}; padding:20px 0; text-align:center; font-style:italic; }

  .result-actions { display:flex; gap:10px; margin-top:32px; }
  .progress-dots { display:flex; gap:5px; margin-bottom:20px; flex-wrap:wrap; }
  .dot { width:9px; height:9px; border-radius:50%; background:${dark?"#1e2d50":"#e0ddd6"}; transition:background 0.3s; border:1px solid ${dark?"#344070":"#ccc"}; }
  .dot.correct{background:#27ae60;border-color:#27ae60} .dot.wrong{background:#e8400c;border-color:#e8400c} .dot.active{background:#f0a800;border-color:#f0a800}
  .spinner { width:32px; height:32px; border:3px solid ${dark?"#344070":"#eee"}; border-top-color:#e8400c; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────

function SettingsPanel({ dark, onToggleDark }) {
  return (
    <div className="settings-panel" onClick={e => e.stopPropagation()}>
      <div className="settings-title">Réglages</div>
      <div className="toggle-row">
        <span>Mode sombre</span>
        <label className="toggle">
          <input type="checkbox" checked={dark} onChange={onToggleDark} />
          <span className="toggle-slider" />
        </label>
      </div>
    </div>
  );
}

function HomePage({ onStart, hallOfFame, loading }) {
  return (
    <div className="card">
      <div className="home-title">QUIZ</div>
      <div className="home-sub">Culture générale — 20 questions</div>
      <div className="home-rules">
        <div className="rule-item"><strong>20</strong>Questions aléatoires</div>
        <div className="rule-item"><strong>15s</strong>Par question</div>
        <div className="rule-item"><strong>1–3</strong>Points par bonne réponse</div>
        <div className="rule-item"><strong>+1</strong>Bonus de rapidité</div>
      </div>
      <button className="btn-primary" onClick={onStart} disabled={loading}>
        {loading ? "CHARGEMENT..." : "LANCER LE QUIZ"}
      </button>
      {hallOfFame.length > 0 && (
        <div style={{marginTop:36}}>
          <div className="hof-title">Hall of Fame</div>
          <ul className="hof-list">
            {hallOfFame.slice(0,5).map((entry,i) => (
              <li key={i} className="hof-item" style={{animationDelay:`${i*0.05}s`}}>
                <span className={`hof-rank ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>{i+1}</span>
                <span className="hof-name">{entry.name}</span>
                <span className="hof-pts">{entry.score.toFixed(2)} pts</span>
                <span className="hof-time">moy. {entry.avgTime}s</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function QuizPage({ questions, onFinish }) {
  const [current, setCurrent]    = useState(0);
  const [timeLeft, setTimeLeft]  = useState(TIMER_MAX);
  const [answered, setAnswered]  = useState(null);
  const [results, setResults]    = useState([]);
  const [score, setScore]        = useState(0);
  const timerRef = useRef(null);
  const q = questions[current];

  const handleAnswer = useCallback((letter, tl) => {
    if (answered) return;
    clearInterval(timerRef.current);
    const correct   = letter === q.bonne;
    const isTimeout = letter === "__timeout__";
    const earned    = correct ? Math.round(calcScore(q.points, tl)*100)/100 : 0;
    setAnswered({letter, correct, isTimeout, earned});
    const nr = [...results, {correct, points:earned, timeLeft:tl}];
    setResults(nr);
    const ns = Math.round((score+earned)*100)/100;
    setScore(ns);
    setTimeout(() => {
      if (current+1 >= questions.length) { onFinish(nr, ns); return; }
      setCurrent(c=>c+1); setTimeLeft(TIMER_MAX); setAnswered(null);
    }, 5000);
  }, [answered, q, results, current, questions.length, onFinish, score]);

  useEffect(() => {
    setTimeLeft(TIMER_MAX);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) { clearInterval(timerRef.current); handleAnswer("__timeout__", 0); return 0; }
        return Math.round((t-0.1)*10)/10;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const pct = (timeLeft/TIMER_MAX)*100;
  const timerColor = pct>50?"#27ae60":pct>25?"#e8a000":"#e8400c";

  return (
    <div className="card">
      <div className="quiz-header">
        <div className="q-counter">{current+1}<span>/{questions.length}</span></div>
        <div className="categorie-badge">{q.categorie}</div>
        <div className="q-score-live">{score.toFixed(2)} pts</div>
      </div>
      <div className="progress-dots">
        {questions.map((_,i) => (
          <div key={i} className={`dot ${i<current?(results[i]?.correct?"correct":"wrong"):i===current?"active":""}`} />
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <div className="timer-digits" style={{color:timerColor}}>{timeLeft.toFixed(1)}</div>
      </div>
      <div className="timer-bar-wrap">
        <div className="timer-bar" style={{width:`${pct}%`,background:timerColor}} />
      </div>
      <div className="question-text">{q.question}</div>
      <div className="answers">
        {q.reponses.map((rep,i) => {
          const letter = LETTERS[i];
          let cls = "answer-btn";
          if (answered) {
            cls += " disabled";
            if (letter===q.bonne) cls += " correct";
            else if (letter===answered.letter && !answered.correct) cls += " wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => !answered && handleAnswer(letter, timeLeft)}>
              <span className="letter">{letter}</span>{rep}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`feedback-bar ${answered.isTimeout?"timeout":answered.correct?"correct":"wrong"}`}>
          {answered.isTimeout ? "Temps écoulé !" : answered.correct ? `+${answered.earned.toFixed(2)} pts` : `Raté — la réponse était ${q.bonne}`}
        </div>
      )}
    </div>
  );
}

function ResultPage({ results, finalScore, hallOfFame, onSaveHof, onRestart }) {
  const [pseudo, setPseudo] = useState("");
  const [saved, setSaved]   = useState(false);
  const correct = results.filter(r=>r.correct).length;
  const avgTime = (results.reduce((s,r)=>s+(TIMER_MAX-r.timeLeft),0)/results.length).toFixed(1);
  const handleSave = () => {
    if (!pseudo.trim()) return;
    onSaveHof(pseudo.trim(), finalScore, parseFloat(avgTime));
    setSaved(true);
  };
  return (
    <div className="card">
      <div className="result-label">Score final</div>
      <div className="result-score">{finalScore.toFixed(2)}</div>
      <div className="result-details">
        <span>{correct}</span>/{results.length} bonnes réponses · temps moyen <span>{avgTime}s</span>
      </div>
      {!saved ? (
        <div className="hof-form">
          <p>Entrer dans le Hall of Fame</p>
          <div className="hof-input-row">
            <input className="hof-input" placeholder="Ton pseudo..." value={pseudo}
              onChange={e=>setPseudo(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSave()} maxLength={20} />
            <button className="btn-submit" onClick={handleSave} disabled={!pseudo.trim()}>INSCRIRE</button>
          </div>
        </div>
      ) : (
        <div className="feedback-bar correct" style={{marginBottom:24}}>Inscrit dans le Hall of Fame !</div>
      )}
      <div>
        <div className="hof-title">Hall of Fame</div>
        {hallOfFame.length===0
          ? <div className="hof-empty">Aucun score enregistré</div>
          : <ul className="hof-list">
              {hallOfFame.map((e,i) => (
                <li key={i} className="hof-item" style={{animationDelay:`${i*0.04}s`}}>
                  <span className={`hof-rank ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>{i+1}</span>
                  <span className={`hof-name ${saved&&e.name===pseudo.trim()&&e.score===finalScore?"me":""}`}>{e.name}</span>
                  <span className={`hof-pts ${saved&&e.name===pseudo.trim()&&e.score===finalScore?"me":""}`}>{e.score.toFixed(2)}</span>
                  <span className="hof-time">moy. {e.avgTime}s</span>
                </li>
              ))}
            </ul>
        }
      </div>
      <div className="result-actions">
        <button className="btn-primary" onClick={onRestart}>REJOUER</button>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]         = useState("home");
  const [db, setDb]                 = useState([]);
  const [dbLoading, setDbLoading]   = useState(true);
  const [questions, setQuestions]   = useState([]);
  const [quizResults, setResults]   = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [hallOfFame, setHoF]        = useState([]);
  const [dark, setDark]             = useState(false);
  const [settingsOpen, setSettings] = useState(false);

  useEffect(() => {
    async function loadDb() {
      try {
        const res  = await fetch("questions.json");
        const data = await res.json();
        setDb(data);
      } catch {
        setDb(FALLBACK_DB);
      }
      setDbLoading(false);
    }
    loadDb();
  }, []);

  useEffect(() => {
    async function loadHoF() {
      try {
        const res = await window.storage.get("quiz_hof", true);
        if (res?.value) setHoF(JSON.parse(res.value));
      } catch {}
    }
    loadHoF();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quiz_dark");
      if (saved !== null) {
        setDark(saved === "1");
      } else {
        // Aucune préférence sauvegardée : suivre le système
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDark(prefersDark);
      }
    } catch {}
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("quiz_dark", next?"1":"0"); } catch {}
  };

  const saveHoF = async (name, score, avgTime) => {
    const entry   = {name, score, avgTime, date: new Date().toLocaleDateString("fr-FR")};
    const updated = [...hallOfFame, entry].sort((a,b)=>b.score-a.score).slice(0,20);
    setHoF(updated);
    try { await window.storage.set("quiz_hof", JSON.stringify(updated), true); } catch {}
  };

  const startQuiz = () => {
    setQuestions(pickQuestions(db));
    setScreen("quiz");
    setSettings(false);
  };

  return (
    <>
      <style>{makeStyles(dark)}</style>
      <div className="app" onClick={() => settingsOpen && setSettings(false)}>
        <button className="settings-btn" onClick={e=>{e.stopPropagation();setSettings(o=>!o)}} title="Réglages">⚙</button>
        {settingsOpen && <SettingsPanel dark={dark} onToggleDark={toggleDark} />}

        {screen==="home" && <HomePage onStart={startQuiz} hallOfFame={hallOfFame} loading={dbLoading} />}
        {screen==="quiz" && <QuizPage key={questions[0]?.id} questions={questions} onFinish={(r,s)=>{setResults(r);setFinalScore(s);setScreen("result");}} />}
        {screen==="result" && <ResultPage results={quizResults} finalScore={finalScore} hallOfFame={hallOfFame} onSaveHof={saveHoF} onRestart={startQuiz} />}
      </div>
    </>
  );
}

// ─── FALLBACK (30 questions embarquées si questions.json non accessible) ─────
const FALLBACK_DB = [
  {id:56,categorie:"Histoire",difficulte:"facile",points:1,question:"Qui était le premier président de la Ve République française ?",reponses:["Charles de Gaulle","Georges Pompidou","François Mitterrand","Valéry Giscard d'Estaing"],bonne:"A",explication:""},
  {id:57,categorie:"Histoire",difficulte:"facile",points:1,question:"En quelle année a eu lieu la Révolution française ?",reponses:["1776","1789","1799","1804"],bonne:"B",explication:""},
  {id:68,categorie:"Histoire",difficulte:"facile",points:1,question:"Quelle guerre mondiale s'est terminée en 1918 ?",reponses:["Première Guerre mondiale","Deuxième Guerre mondiale","Guerre de Corée","Guerre du Vietnam"],bonne:"A",explication:""},
  {id:63,categorie:"Histoire",difficulte:"facile",points:1,question:"Quel empire Alexandre le Grand a-t-il fondé ?",reponses:["L'Empire romain","L'Empire perse","L'Empire macédonien","L'Empire ottoman"],bonne:"C",explication:""},
  {id:64,categorie:"Histoire",difficulte:"facile",points:1,question:"Quel est le premier pays à avoir légalisé le mariage entre personnes de même sexe en 2001 ?",reponses:["Canada","Pays-Bas","Belgique","Danemark"],bonne:"B",explication:""},
  {id:59,categorie:"Histoire",difficulte:"moyen",points:2,question:"En quelle année le mur de Berlin est-il tombé ?",reponses:["1987","1989","1991","1993"],bonne:"B",explication:""},
  {id:66,categorie:"Histoire",difficulte:"moyen",points:2,question:"Quel traité a mis fin à la Première Guerre mondiale ?",reponses:["Traité de Versailles","Traité de Paris","Traité de Vienne","Traité de Berlin"],bonne:"A",explication:""},
  {id:60,categorie:"Histoire",difficulte:"moyen",points:2,question:"En quelle année Napoléon est-il devenu empereur des Français ?",reponses:["1799","1802","1804","1806"],bonne:"C",explication:""},
  {id:70,categorie:"Histoire",difficulte:"moyen",points:2,question:"Qui était Cléopâtre VII ?",reponses:["Une reine de Grèce","La dernière pharaonne d'Égypte","Une impératrice romaine","Une reine de Carthage"],bonne:"B",explication:""},
  {id:181,categorie:"Histoire",difficulte:"moyen",points:2,question:"En quelle année la France a-t-elle aboli la peine de mort ?",reponses:["1974","1981","1985","1988"],bonne:"B",explication:""},
  {id:65,categorie:"Histoire",difficulte:"difficile",points:3,question:"Quel général romain a franchi le Rubicon en 49 avant J.-C. ?",reponses:["Pompée","Jules César","Crassus","Marc Antoine"],bonne:"B",explication:""},
  {id:62,categorie:"Histoire",difficulte:"difficile",points:3,question:"Quel duo a écrit les paroles du Chant des Partisans ?",reponses:["Louis Aragon et Elsa Triolet","Joseph Kessel et Maurice Druon","Robert Desnos et Blaise Cendrars","Guillaume Apollinaire et Charles Péguy"],bonne:"B",explication:""},
  {id:88,categorie:"Science",difficulte:"facile",points:1,question:"Combien de planètes compte notre système solaire ?",reponses:["7","8","9","10"],bonne:"B",explication:""},
  {id:94,categorie:"Science",difficulte:"facile",points:1,question:"Quelle est la formule chimique de l'eau ?",reponses:["CO2","H2O","NaCl","O2"],bonne:"B",explication:""},
  {id:93,categorie:"Science",difficulte:"facile",points:1,question:"Quel scientifique a formulé la théorie de la relativité ?",reponses:["Isaac Newton","Nikola Tesla","Albert Einstein","Stephen Hawking"],bonne:"C",explication:""},
  {id:90,categorie:"Science",difficulte:"moyen",points:2,question:"Quel élément chimique a le symbole Au ?",reponses:["Argent","Aluminium","Or","Argon"],bonne:"C",explication:""},
  {id:97,categorie:"Science",difficulte:"moyen",points:2,question:"Quelle planète est surnommée la planète rouge ?",reponses:["Vénus","Jupiter","Mars","Saturne"],bonne:"C",explication:""},
  {id:99,categorie:"Science",difficulte:"moyen",points:2,question:"Qui a découvert la pénicilline ?",reponses:["Louis Pasteur","Marie Curie","Alexander Fleming","Joseph Lister"],bonne:"C",explication:""},
  {id:91,categorie:"Science",difficulte:"difficile",points:3,question:"Quel est le numéro atomique de l'or ?",reponses:["47","79","82","92"],bonne:"B",explication:""},
  {id:96,categorie:"Science",difficulte:"difficile",points:3,question:"Quelle loi stipule que l'énergie ne se crée ni ne se détruit ?",reponses:["Loi de Coulomb","Loi d'Ohm","Premier principe de la thermodynamique","Loi de Boyle-Mariotte"],bonne:"C",explication:""},
  {id:51,categorie:"Géographie",difficulte:"facile",points:1,question:"Quelle est la capitale de l'Australie ?",reponses:["Sydney","Melbourne","Canberra","Brisbane"],bonne:"C",explication:""},
  {id:52,categorie:"Géographie",difficulte:"facile",points:1,question:"Quelle est la capitale du Japon ?",reponses:["Osaka","Kyoto","Tokyo","Hiroshima"],bonne:"C",explication:""},
  {id:47,categorie:"Géographie",difficulte:"moyen",points:2,question:"Quel est le plus petit pays du monde ?",reponses:["Monaco","Liechtenstein","Vatican","Saint-Marin"],bonne:"C",explication:""},
  {id:49,categorie:"Géographie",difficulte:"moyen",points:2,question:"Quel pays possède le plus grand territoire au monde ?",reponses:["Canada","Chine","États-Unis","Russie"],bonne:"D",explication:""},
  {id:44,categorie:"Géographie",difficulte:"difficile",points:3,question:"Quel détroit sépare l'Afrique de l'Europe ?",reponses:["Détroit de Malacca","Détroit d'Ormuz","Détroit de Gibraltar","Détroit de Magellan"],bonne:"C",explication:""},
  {id:21,categorie:"Culture pop",difficulte:"facile",points:1,question:"Dans quelle série voit-on Ross, Rachel et Monica ?",reponses:["Seinfeld","How I Met Your Mother","Friends","The Big Bang Theory"],bonne:"C",explication:""},
  {id:29,categorie:"Culture pop",difficulte:"facile",points:1,question:"Quel groupe a chanté Bohemian Rhapsody ?",reponses:["The Beatles","Led Zeppelin","Queen","The Rolling Stones"],bonne:"C",explication:""},
  {id:24,categorie:"Culture pop",difficulte:"moyen",points:2,question:"Quel artiste a sorti l'album Thriller en 1982 ?",reponses:["Prince","Michael Jackson","David Bowie","Whitney Houston"],bonne:"B",explication:""},
  {id:27,categorie:"Culture pop",difficulte:"difficile",points:3,question:"Quel film a remporté la Palme d'or à Cannes en 2019 ?",reponses:["Parasite","Portrait de la jeune fille en feu","Once Upon a Time in Hollywood","Les Misérables"],bonne:"A",explication:""},
  {id:109,categorie:"Sport",difficulte:"facile",points:1,question:"Combien de joueurs compte une équipe de football sur le terrain ?",reponses:["9","10","11","12"],bonne:"C",explication:""},
  {id:124,categorie:"Sport",difficulte:"facile",points:1,question:"Quel pays a remporté la Coupe du Monde de football en 2018 ?",reponses:["Brésil","Allemagne","France","Argentine"],bonne:"C",explication:""},
  {id:121,categorie:"Sport",difficulte:"moyen",points:2,question:"Quel club a remporté le plus de Ligues des Champions ?",reponses:["FC Barcelone","Bayern Munich","Real Madrid","Liverpool"],bonne:"C",explication:""},
  {id:119,categorie:"Sport",difficulte:"difficile",points:3,question:"Quel athlète a couru le 100m en 9,58 secondes, record du monde ?",reponses:["Carl Lewis","Maurice Greene","Usain Bolt","Tyson Gay"],bonne:"C",explication:""},
  {id:157,categorie:"Sport",difficulte:"difficile",points:3,question:"Qui est le dernier tennisman à avoir réussi le Grand Chelem calendaire ?",reponses:["Borg","Federer","Laver","Arthur Ashe"],bonne:"C",explication:""},
];
