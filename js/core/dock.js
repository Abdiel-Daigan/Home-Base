// ============================================================
// RIGHT DOCK — widgets: todos, deadlines, continue playing
// ============================================================
import { state, saveState } from '../core/storage.js';
import { escapeHTML, uid, fmtDate } from '../core/utils.js';
import { render as rerender } from '../core/router.js';

const dock        = document.getElementById('dock');
const dockBody    = document.getElementById('dock-body');
const dockButtons = document.getElementById('dock-buttons');

let currentWidget = null;

export function openWidget(name) {
  currentWidget = name;
  dock.classList.add('open');
  renderWidget();
  document.querySelectorAll('.dock-toggle').forEach(b => {
    b.classList.toggle('active', b.dataset.widget === name);
  });
}

export function closeWidget() {
  currentWidget = null;
  dock.classList.remove('open');
  document.querySelectorAll('.dock-toggle').forEach(b => b.classList.remove('active'));
}

export function toggleWidget(name) {
  if (currentWidget === name) closeWidget();
  else openWidget(name);
}

function renderWidget() {
  if (!currentWidget) { dockBody.innerHTML = ''; return; }
  if (currentWidget === 'todos')      dockBody.innerHTML = renderTodosWidget();
  if (currentWidget === 'deadlines')  dockBody.innerHTML = renderDeadlinesWidget();
  if (currentWidget === 'continue')   dockBody.innerHTML = renderContinueWidget();
}

function renderTodosWidget() {
  const items = (state.todos || []).filter(t => !t.done);
  return `
    <div class="dock-widget-header">
      <h3>✅ to-do</h3>
      <button class="dock-close" onclick="closeDock()" aria-label="close">✕</button>
    </div>
    ${items.length === 0
      ? '<div class="dock-empty">nothing left to do 🌿</div>'
      : items.map(t => `
        <div class="dock-item">
          <span class="dock-item-name">${escapeHTML(t.text)}</span>
          <button class="small" onclick="dockToggleTodo('${t.id}')">✓</button>
        </div>
      `).join('')}
    <div class="dock-add-row">
      <input id="dock-todo-text" placeholder="new task...">
      <button class="primary" onclick="dockAddTodo()">add</button>
    </div>
  `;
}

export function dockAddTodo() {
  const input = document.getElementById('dock-todo-text');
  const text = (input?.value || '').trim();
  if (!text) return;
  state.todos.push({ id: uid(), text, priority: 'medium', done: false });
  saveState();
  renderWidget();
  rerender();
}

export function dockToggleTodo(id) {
  const t = state.todos.find(t => t.id === id);
  if (t) { t.done = !t.done; saveState(); renderWidget(); rerender(); }
}

function renderDeadlinesWidget() {
  const sorted = [...state.assignments].sort((a, b) => new Date(a.due) - new Date(b.due));
  return `
    <div class="dock-widget-header">
      <h3>⏳ deadlines</h3>
      <button class="dock-close" onclick="closeDock()" aria-label="close">✕</button>
    </div>
    ${sorted.length === 0
      ? '<div class="dock-empty">no assignments yet</div>'
      : sorted.map(a => `
        <div class="dock-item">
          <span class="dock-item-name">
            ${escapeHTML(a.name)}
            <br><span class="small-text">${fmtDate(a.due)}</span>
          </span>
        </div>
      `).join('')}
  `;
}

function renderContinueWidget() {
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  const recent = state.playSessions
    .filter(s => new Date(s.start).getTime() >= cutoff)
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  const seen = new Set();
  const games = [];
  for (const s of recent) {
    if (seen.has(s.gameName)) continue;
    seen.add(s.gameName);
    games.push(s);
    if (games.length >= 8) break;
  }

  const active = state.playSessions.find(s => !s.end);

  return `
    <div class="dock-widget-header">
      <h3>🎮 continue playing</h3>
      <button class="dock-close" onclick="closeDock()" aria-label="close">✕</button>
    </div>
    ${games.length === 0
      ? '<div class="dock-empty">no recent games — start one from the game picker</div>'
      : games.map(g => {
        const lib = state.games.find(x => x.name === g.gameName);
        const thumb = lib?.image
          ? `<img src="${lib.image}" class="dock-thumb" alt="">`
          : `<div class="dock-thumb dock-thumb-placeholder">🎮</div>`;
        const isActive = active && active.gameName === g.gameName;
        return `
          <div class="dock-item dock-item-game">
            ${thumb}
            <span class="dock-item-name">
              ${escapeHTML(g.gameName)}
              <br><span class="small-text">last played ${fmtDate(g.start)}</span>
            </span>
            ${isActive
              ? `<button class="small" onclick="dockStopPlay('${active.id}')">stop</button>`
              : `<button class="small primary" onclick="dockPlayGame('${escapeHTML(g.gameName)}')">play</button>`}
          </div>
        `;
      }).join('')}
  `;
}

export function dockPlayGame(gameName) {
  const active = state.playSessions.find(s => !s.end);
  if (active) active.end = new Date().toISOString();
  state.playSessions.push({
    id: uid(),
    gameName,
    start: new Date().toISOString(),
    end: null,
  });
  saveState();
  renderWidget();
  rerender();
}

export function dockStopPlay(sessionId) {
  const s = state.playSessions.find(s => s.id === sessionId);
  if (s) { s.end = new Date().toISOString(); saveState(); renderWidget(); rerender(); }
}

export function initDock() {
  dockButtons.querySelectorAll('.dock-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleWidget(btn.dataset.widget));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentWidget) closeWidget();
  });
}

window.closeDock = closeWidget;
window.dockAddTodo = dockAddTodo;
window.dockToggleTodo = dockToggleTodo;
window.dockPlayGame = dockPlayGame;
window.dockStopPlay = dockStopPlay;

export function refreshDock() {
  if (currentWidget) renderWidget();
}
