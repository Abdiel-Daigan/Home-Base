// ============================================================
// VIEW — Play tracking
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import '../actions/playActions.js';

let playTick = null;

export function renderPlayTracking(root) {
  if (playTick) clearInterval(playTick);

  const active = state.playSessions.find(s => !s.end);
  const totalMinutes = {};
  state.playSessions.filter(s => s.end).forEach(s => {
    const m = (new Date(s.end) - new Date(s.start)) / 60000;
    totalMinutes[s.gameName] = (totalMinutes[s.gameName] || 0) + m;
  });

  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const playedThisMonth = new Set(
    state.playSessions.filter(s => new Date(s.start) >= monthStart).map(s => s.gameName)
  );

  root.innerHTML = `
    ${backButton()}
    <h2>⏱️ play tracking</h2>

    <div class="card">
      <h3>game library</h3>
      <p class="small-text">paste games, one per line: <code>Game Name | tag1, tag2</code></p>
      <textarea id="library-input" rows="4" style="width:100%; margin-top:0.5rem;">${state.games.map(g =>
        `${g.name} | ${(g.tags || []).join(', ')}`).join('\n')}</textarea>
      <button class="primary small" style="margin-top:0.5rem;" onclick="saveLibrary()">save library</button>
    </div>

    ${active ? `
      <div class="card" style="border-left:4px solid var(--accent);">
        <h3>now playing: ${escapeHTML(active.gameName)}</h3>
        <div class="timer-display" id="play-timer">--:--</div>
        <button class="primary" onclick="stopPlaying('${active.id}')">stop playing</button>
      </div>
    ` : ''}

    <div class="card">
      <h3>recent sessions</h3>
      ${state.playSessions.length === 0 ? '<div class="empty-msg">no sessions yet</div>' :
        [...state.playSessions].reverse().slice(0, 10).map(s => `
          <div class="history-item">
            <strong>${escapeHTML(s.gameName)}</strong> — ${fmtDate(s.start)}
            ${s.end
              ? `→ ${fmtDate(s.end)} (${Math.round((new Date(s.end) - new Date(s.start)) / 60000)}m)
                 <button class="small" onclick="editSessionEnd('${s.id}')">edit end</button>`
              : '· in progress'}
          </div>
        `).join('')}
    </div>

    <div class="card">
      <h3>total minutes per game</h3>
      ${Object.keys(totalMinutes).length === 0 ? '<div class="empty-msg">no completed sessions yet</div>' :
        Object.entries(totalMinutes).map(([n, m]) => `
          <div class="flex-between history-item"><span>${escapeHTML(n)}</span><span>${Math.round(m)} min</span></div>
        `).join('')}
    </div>

    <div class="card">
      <h3>backlog progress</h3>
      <p>games played this month: <strong>${playedThisMonth.size}</strong></p>
    </div>

    <div class="card">
      <h3>finish it list</h3>
      ${state.finishList.length === 0 ? '<div class="empty-msg">nothing on your finish list</div>' :
        state.finishList.map((f, i) => `
          <div class="flex-between history-item">
            <span>${escapeHTML(f.gameName)}</span>
            <button class="small danger" onclick="removeFinish(${i})">remove</button>
          </div>
        `).join('')}
      <div class="row" style="margin-top:0.5rem;">
        <input id="finish-name" placeholder="game name" style="flex:1;">
        <button class="small" onclick="addFinish()">add</button>
      </div>
    </div>
  `;

  if (active) {
    playTick = setInterval(() => {
      const el = document.getElementById('play-timer');
      if (!el) return;
      const secs = Math.floor((Date.now() - new Date(active.start)) / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }
}
