// ============================================================
// VIEW — Game Library (formerly Play Tracking)
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import { TAG_OPTIONS } from '../core/constants.js';
import { playGame } from '../actions/gameActions.js';
import '../actions/playActions.js';

let playTick = null;

const formState = {
  tags: new Set(),
  imageData: null,
  editingIndex: null,
  hoursPlayed: 0,
  minutesPlayed: 0,
};

export function getFormState() { return formState; }

export function resetForm() {
  formState.tags = new Set();
  formState.imageData = null;
  formState.editingIndex = null;
  formState.hoursPlayed = 0;
  formState.minutesPlayed = 0;
}

function totalMinutesFor(name) {
  return state.playSessions
    .filter(s => s.end && s.gameName === name)
    .reduce((sum, s) => sum + (new Date(s.end) - new Date(s.start)) / 60000, 0);
}

function recentMinutesFor(name) {
  const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
  return state.playSessions
    .filter(s => s.end && s.gameName === name && new Date(s.start).getTime() >= cutoff)
    .reduce((sum, s) => sum + (new Date(s.end) - new Date(s.start)) / 60000, 0);
}

function fmtHM(mins) {
  const total = Math.max(0, Math.round(mins));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

export function renderPlayTracking(root) {
  if (playTick) clearInterval(playTick);

  const active = state.playSessions.find(s => !s.end);
  const activeGame = active ? state.games.find(g => g.name === active.gameName) : null;

  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const playedThisMonth = new Set(
    state.playSessions.filter(s => new Date(s.start) >= monthStart).map(s => s.gameName)
  );

  const recentSessions = [...state.playSessions].reverse().slice(0, 10);

  root.innerHTML = `
    ${backButton()}
    <h2>🎮 game library</h2>

    <!-- ============ TOP DASHBOARD ============ -->
    <div class="grid-2" style="margin-bottom: 1.5rem;">
      <div class="card" style="margin-bottom: 0;">
        <h3 style="font-size:1rem; margin-bottom:0.6rem;">recent sessions</h3>
        ${recentSessions.length === 0 ? '<div class="empty-msg">no sessions yet</div>' :
          `<div class="recent-sessions-list">
            ${recentSessions.map(s => {
              const lib = state.games.find(x => x.name === s.gameName);
              const img = lib?.image ? `<img src="${lib.image}" alt="">` : `<div class="recent-thumb-placeholder">🎮</div>`;
              const duration = s.end ? Math.round((new Date(s.end) - new Date(s.start)) / 60000) : 'in progress';
              return `
                <div class="recent-session-card">
                  ${img}
                  <div class="recent-session-info">
                    <strong>${escapeHTML(s.gameName)}</strong>
                    <div class="small-text">${fmtDate(s.start)}</div>
                    <div class="small-text">${duration === 'in progress' ? duration : duration + 'm'}</div>
                  </div>
                  <div class="recent-session-actions">
                    <button class="small danger" onclick="deleteSession('${s.id}')">✕</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`}
      </div>
      
      <div class="card" style="margin-bottom: 0;">
        <h3 style="font-size:1rem; margin-bottom:0.6rem;">backlog progress</h3>
        <p class="small-text" style="margin-bottom:0.4rem;">games played this month</p>
        <div class="timer-display" style="font-size:1.8rem; margin:0.2rem 0;">${playedThisMonth.size}</div>
        <p class="small-text">out of ${state.games.length} in your library</p>
      </div>
    </div>

    <!-- ============ NOW PLAYING (Full Width) ============ -->
    ${active ? `
      <div class="card" style="border-left:4px solid var(--accent); margin-bottom: 1.5rem; display:flex; align-items:center; gap:1.2rem;">
        ${activeGame?.image 
          ? `<img src="${activeGame.image}" style="width:100px; height:56px; object-fit:cover; border-radius:12px; flex-shrink:0;">`
          : `<div style="width:100px; height:56px; border-radius:12px; background:#0b0d10; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">🎮</div>`
        }
        <div style="flex:1;">
          <div class="flex-between">
            <div>
              <h3 style="margin:0;">now playing: ${escapeHTML(active.gameName)}</h3>
              ${active.paused ? '<span class="small-text deadline-yellow" style="display:block; margin-top:0.2rem;">⏸ paused</span>' : ''}
            </div>
            <div class="row" style="gap:0.5rem;">
              <button class="primary" onclick="togglePause('${active.id}')">
                ${active.paused ? 'resume' : 'pause'}
              </button>
              <button class="danger" onclick="stopPlaying('${active.id}')">stop playing</button>
            </div>
          </div>
          <div class="timer-display" id="play-timer" style="text-align:left; font-size:2.5rem; margin-top:0.5rem;">--:--</div>
        </div>
      </div>
    ` : ''}

    <!-- ============ LIBRARY HEADER ============ -->
    <div class="flex-between" style="margin-bottom:0.8rem;">
      <h3 style="font-size:1.1rem;">your games <span class="small-text">(${state.games.length})</span></h3>
      <button class="primary" onclick="openGameCreate()">＋ add game</button>
    </div>

    <!-- ============ LIBRARY GRID ============ -->
    <div class="card">
      ${state.games.length === 0
        ? '<div class="empty-msg">no games yet — click “add game” to start 🎮</div>'
        : `<div class="game-library-grid">
            ${state.games.map((g, i) => {
              const total = totalMinutesFor(g.name) + (g.manualMinutes || 0);
              const recent = recentMinutesFor(g.name);
              return `
                <div class="game-lib-card" onclick="openGameEdit(${i})">
                  ${g.image
                    ? `<img src="${g.image}" alt="">`
                    : `<div class="game-lib-placeholder">🎮</div>`}
                  <div class="game-lib-info">
                    <strong>${escapeHTML(g.name)}</strong>
                    <div class="small-text">${fmtHM(total)} total</div>
                    ${recent > 0 ? `<div class="small-text deadline-green">${fmtHM(recent)} recent</div>` : ''}
                  </div>
                  <!-- Hover Play Button -->
                  <button class="play-hover-btn primary" onclick="event.stopPropagation(); playGame('${escapeHTML(g.name)}')">▶ Play</button>
                </div>
              `;
            }).join('')}
          </div>`}
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

    <!-- ============ GAME EDITOR MODAL ============ -->
    <div id="game-modal" class="modal-backdrop hidden">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3 id="game-modal-title">add game</h3>
          <button class="dock-close" onclick="closeGameModal()" aria-label="close">✕</button>
        </div>

        <div class="row" style="align-items:flex-start; gap: 1.5rem;">
          <div class="cover-uploader cover-uploader-large" onclick="openImageEditor()" title="click to add cover">
            ${formState.imageData
              ? `<img src="${formState.imageData}" alt="cover">`
              : `<div class="cover-placeholder">＋<br><span class="small-text">cover</span></div>`}
          </div>
          <div style="flex:1; min-width:200px;">
            <input id="game-name" placeholder="game name" style="width:100%; font-size:1.1rem; padding: 0.8rem 1rem;">
            <div class="row" style="margin-top:0.8rem; gap:0.6rem;">
              <label class="small-text">hours played</label>
              <input id="game-hours" type="number" min="0" step="1" value="0" style="width:80px;">
              <span class="small-text">h</span>
              <input id="game-mins" type="number" min="0" max="59" step="1" value="0" style="width:80px;">
              <span class="small-text">m</span>
            </div>
          </div>
        </div>

        <div style="margin-top:1.2rem;">
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

        <div class="row" style="margin-top:1.5rem; justify-content:space-between;">
          <div>
            ${formState.editingIndex !== null
              ? `<button class="small danger" onclick="deleteGame(${formState.editingIndex})">delete game</button>`
              : ''}
          </div>
          <div class="row" style="gap:0.5rem;">
            <button onclick="closeGameModal()">cancel</button>
            <button class="primary" onclick="saveGame()">
              ${formState.editingIndex !== null ? 'save changes' : 'add game'}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ IMAGE EDITOR MODAL ============ -->
    <div id="image-editor" class="modal-backdrop hidden">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3>cover image</h3>
          <button class="dock-close" onclick="closeImageEditor()" aria-label="close">✕</button>
        </div>
        <p class="small-text">choose an image, then drag to position and zoom. output is 320×180.</p>
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
        <div class="row" style="margin-top:1rem; justify-content:flex-end;">
          <button onclick="closeImageEditor()">cancel</button>
          <button class="primary" onclick="applyEditorImage()">use this image</button>
        </div>
      </div>
    </div>
  `;

  if (active) {
    const updateTimer = () => {
      const el = document.getElementById('play-timer');
      if (!el) return;
      
      if (active.paused) {
        const secs = Math.floor((new Date(active.pauseStart) - new Date(active.start)) / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      } else {
        const secs = Math.floor((Date.now() - new Date(active.start)) / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    };
    
    updateTimer();
    if (!active.paused) {
      playTick = setInterval(updateTimer, 1000);
    }
  }

  if (window._editorState?.image) {
    requestAnimationFrame(drawEditor);
  }
}
