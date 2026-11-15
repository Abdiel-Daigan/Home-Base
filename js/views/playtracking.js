// ============================================================
// VIEW — Game Library (formerly Play Tracking)
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import '../actions/playActions.js';

let playTick = null;

export const TAG_OPTIONS = [
  'cozy', 'relaxing', 'farming', 'casual',
  'intense', 'action', 'fast', 'competitive',
  'story-heavy', 'narrative', 'rpg', 'adventure',
  'puzzle', 'strategy', 'tactical', 'brain',
  'short-session', 'arcade',
  'brain-off', 'idle',
];

// Form state for create/edit. `editingIndex` is null when creating.
const formState = {
  tags: new Set(),
  imageData: null,
  editingIndex: null,   // index into state.games, or null
  hoursPlayed: 0,       // manual hours played (editable)
  minutesPlayed: 0,     // manual extra minutes (0–59)
};

export function getFormState() { return formState; }

export function resetForm() {
  formState.tags = new Set();
  formState.imageData = null;
  formState.editingIndex = null;
  formState.hoursPlayed = 0;
  formState.minutesPlayed = 0;
}

// Compute total minutes for a game from sessions (completed only)
function totalMinutesFor(name) {
  return state.playSessions
    .filter(s => s.end && s.gameName === name)
    .reduce((sum, s) => sum + (new Date(s.end) - new Date(s.start)) / 60000, 0);
}

// Compute recent minutes (last 14 days) for a game
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

  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const playedThisMonth = new Set(
    state.playSessions.filter(s => new Date(s.start) >= monthStart).map(s => s.gameName)
  );

  // recent sessions (last 10)
  const recentSessions = [...state.playSessions].reverse().slice(0, 10);

  root.innerHTML = `
    ${backButton()}
    <h2>🎮 game library</h2>

    <!-- ============ HEADER + ADD BUTTON ============ -->
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
                    <div class="small-text">${fmtHM(recent)} recent</div>
                  </div>
                </div>
              `;
            }).join('')}
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

    <!-- ============ GAME EDITOR MODAL (create + edit) ============ -->
    <div id="game-modal" class="modal-backdrop hidden">
      <div class="modal">
        <div class="modal-header">
          <h3 id="game-modal-title">add game</h3>
          <button class="dock-close" onclick="closeGameModal()" aria-label="close">✕</button>
        </div>

        <div class="row" style="align-items:flex-start;">
          <div class="cover-uploader" onclick="openImageEditor()" title="click to add cover">
            ${formState.imageData
              ? `<img src="${formState.imageData}" alt="cover">`
              : `<div class="cover-placeholder">＋<br><span class="small-text">cover</span></div>`}
          </div>
          <div style="flex:1; min-width:180px;">
            <input id="game-name" placeholder="game name" style="width:100%;">
            <div class="row" style="margin-top:0.5rem; gap:0.4rem;">
              <label class="small-text">hours played</label>
              <input id="game-hours" type="number" min="0" step="1" value="0" style="width:70px;">
              <span class="small-text">h</span>
              <input id="game-mins" type="number" min="0" max="59" step="1" value="0" style="width:70px;">
              <span class="small-text">m</span>
            </div>
          </div>
        </div>

        <div style="margin-top:0.6rem;">
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

        <div class="row" style="margin-top:1rem; justify-content:space-between;">
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
      <div class="modal">
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
        <div class="row" style="margin-top:0.8rem; justify-content:flex-end;">
          <button onclick="closeImageEditor()">cancel</button>
          <button class="primary" onclick="applyEditorImage()">use this image</button>
        </div>
      </div>
    </div>
  `;

  // Bottom-right sidebar (part of page body)
  const sidebarHTML = `
    <aside class="page-sidebar">
      <div class="card" style="margin-bottom:0.8rem;">
        <h3 style="font-size:1rem;">recent sessions</h3>
        ${recentSessions.length === 0 ? '<div class="empty-msg">no sessions yet</div>' :
          recentSessions.map(s => `
            <div class="history-item">
              <strong>${escapeHTML(s.gameName)}</strong> — ${fmtDate(s.start)}
              ${s.end
                ? `→ ${Math.round((new Date(s.end) - new Date(s.start)) / 60000)}m
                   <button class="small" onclick="editSessionEnd('${s.id}')">edit</button>`
                : '· in progress'}
            </div>
          `).join('')}
      </div>
      <div class="card">
        <h3 style="font-size:1rem;">backlog progress</h3>
        <p class="small-text" style="margin-bottom:0.4rem;">games played this month</p>
        <div class="timer-display" style="font-size:1.8rem; margin:0.2rem 0;">${playedThisMonth.size}</div>
        <p class="small-text">out of ${state.games.length} in your library</p>
      </div>
    </aside>
  `;

  // Wrap main content + sidebar in a two-column layout
  // Rebuild root with a flex layout: content on left, sidebar on right
  const existingContent = root.innerHTML;
  root.innerHTML = `
    <div class="library-layout">
      <div class="library-main">${existingContent}</div>
      ${sidebarHTML}
    </div>
  `;

  // Move the modals back out of the layout so they overlay correctly
  // (they are position:fixed, so being inside a flex child is fine — leave them.)

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

  if (window._editorState?.image) {
    requestAnimationFrame(drawEditor);
  }
}
