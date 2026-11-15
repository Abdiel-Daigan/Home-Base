// ============================================================
// VIEW — Play tracking (with intuitive game library form)
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import '../actions/playActions.js';

let playTick = null;

// The tag pool offered as chips in the add-game form.
// Matches the mood picker's vocabulary so draws work.
export const TAG_OPTIONS = [
  'cozy', 'relaxing', 'farming', 'casual',
  'intense', 'action', 'fast', 'competitive',
  'story-heavy', 'narrative', 'rpg', 'adventure',
  'puzzle', 'strategy', 'tactical', 'brain',
  'short-session', 'arcade',
  'brain-off', 'idle',
];

// A single in-flight form state, reset after each add
const formState = {
  tags: new Set(),
  imageData: null,   // dataURL from the editor
};

export function getFormState() { return formState; }
export function resetForm() {
  formState.tags = new Set();
  formState.imageData = null;
}

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

    <!-- ============ ADD GAME FORM ============ -->
    <div class="card">
      <h3 style="margin-bottom:0.8rem;">add a game</h3>

      <div class="row" style="align-items:flex-start;">
        <!-- cover preview / upload -->
        <div class="cover-uploader" onclick="openImageEditor()" title="click to add cover">
          ${formState.imageData
            ? `<img src="${formState.imageData}" alt="cover">`
            : `<div class="cover-placeholder">＋<br><span class="small-text">cover</span></div>`}
        </div>

        <div style="flex:1; min-width:200px;">
          <input id="game-name" placeholder="game name" style="width:100%;">
          <div style="margin-top:0.5rem;">
            <span class="small-text">tags</span>
            <div id="tag-chip-row" class="tag-chip-row">
              ${TAG_OPTIONS.map(t => `
                <button type="button"
                        class="tag-chip ${formState.tags.has(t) ? 'selected' : ''}"
                        data-tag="${t}"
                        onclick="toggleTagChip('${t}')">${t}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="row" style="margin-top:0.8rem;">
        <button class="primary" onclick="addGame()">add game</button>
        <button class="small" onclick="openImageEditor()">${formState.imageData ? 'change cover' : 'add cover'}</button>
      </div>
    </div>

    <!-- ============ LIBRARY GRID ============ -->
    <div class="card">
      <h3>game library <span class="small-text">(${state.games.length})</span></h3>
      ${state.games.length === 0
        ? '<div class="empty-msg">no games yet — add one above 🎮</div>'
        : `<div class="game-library-grid">
            ${state.games.map((g, i) => `
              <div class="game-lib-card">
                ${g.image
                  ? `<img src="${g.image}" alt="">`
                  : `<div class="game-lib-placeholder">🎮</div>`}
                <div class="game-lib-info">
                  <strong>${escapeHTML(g.name)}</strong>
                  <div class="small-text">${(g.tags || []).join(', ') || 'no tags'}</div>
                </div>
                <button class="small danger" onclick="deleteGame(${i})">✕</button>
              </div>
            `).join('')}
          </div>`}
    </div>

    <!-- ============ NOW PLAYING ============ -->
    ${active ? `
      <div class="card" style="border-left:4px solid var(--accent);">
        <h3>now playing: ${escapeHTML(active.gameName)}</h3>
        <div class="timer-display" id="play-timer">--:--</div>
        <button class="primary" onclick="stopPlaying('${active.id}')">stop playing</button>
      </div>
    ` : ''}

    <!-- ============ RECENT SESSIONS ============ -->
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

    <!-- ============ TOTALS + BACKLOG ============ -->
    <div class="card">
      <h3>total minutes per game</h3>
      ${Object.keys(totalMinutes).length === 0 ? '<div class="empty-msg">no completed sessions yet</div>' :
        Object.entries(totalMinutes).map(([n, m]) => `
          <div class="flex-between history-item">
            <span>${escapeHTML(n)}</span><span>${Math.round(m)} min</span>
          </div>
        `).join('')}
    </div>

    <div class="card">
      <h3>backlog progress</h3>
      <p>games played this month: <strong>${playedThisMonth.size}</strong></p>
    </div>

    <!-- ============ FINISH IT LIST ============ -->
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

    <!-- ============ IMAGE EDITOR MODAL ============ -->
    <div id="image-editor" class="modal-backdrop hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>cover image</h3>
          <button class="dock-close" onclick="closeImageEditor()" aria-label="close">✕</button>
        </div>
        <p class="small-text">choose an image, then drag to position and zoom. output is ${320}×${180}.</p>
        <input type="file" id="image-file" accept="image/*" onchange="loadEditorImage(event)">
        <div id="editor-stage" class="editor-stage">
          <canvas id="editor-canvas" width="320" height="180"></canvas>
          <div id="editor-hint" class="editor-hint">no image yet</div>
        </div>
        <div class="editor-controls">
          <label class="small-text">zoom</label>
          <input type="range" id="editor-zoom" min="1" max="3" step="0.01" value="1"
                 oninput="updateEditorZoom(this.value)">
          <button class="small" onclick="resetEditorView()">reset view</button>
        </div>
        <div class="row" style="margin-top:0.8rem; justify-content:flex-end;">
          <button onclick="closeImageEditor()">cancel</button>
          <button class="primary" onclick="applyEditorImage()">use this image</button>
        </div>
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

  // draw editor if an image was already loaded into it
  if (window._editorState?.image) {
    requestAnimationFrame(drawEditor);
  }
}
