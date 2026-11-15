// ============================================================
// VIEW — Focus page (one task + pomodoro)
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import '../actions/focusActions.js';

export let focusTimerInterval = null;
export let focusSecondsLeft = 25 * 60;

export function getMostUrgentTask() {
  if (!window._focusSkips) window._focusSkips = new Set();
  const items = [];
  state.assignments.forEach(a => {
    if (window._focusSkips.has(a.id)) return;
    const allDone = a.substeps?.length > 0 && a.substeps.every(s => s.done);
    if (!allDone) items.push({ type: 'assignment', name: a.name, due: a.due, id: a.id });
  });
  state.todos.forEach(t => {
    if (t.done || window._focusSkips.has(t.id)) return;
    items.push({ type: 'todo', name: t.text, due: null, id: t.id, priority: t.priority });
  });
  if (!items.length) return null;
  items.sort((a, b) => {
    if (a.due && b.due) return new Date(a.due) - new Date(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
  });
  return items[0];
}

export function setFocusTimer(interval, secondsLeft) {
  focusTimerInterval = interval;
  focusSecondsLeft = secondsLeft;
}

export function stopFocusTimer() {
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusSecondsLeft = 25 * 60;
}

export function updateTimerDisplay() {
  const el = document.getElementById('focus-timer');
  if (!el) return;
  const m = Math.floor(focusSecondsLeft / 60);
  const s = focusSecondsLeft % 60;
  el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function renderFocus(root) {
  const task = getMostUrgentTask();
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  focusSecondsLeft = 25 * 60;

  root.innerHTML = `
    ${backButton()}
    <h2>🎯 what do i do right now</h2>
    ${task ? `
      <div class="card" style="border-left:4px solid var(--accent);">
        <div class="small-text">${task.type === 'assignment' ? 'assignment' : 'task'}</div>
        <h3 style="margin:0.3rem 0;">${escapeHTML(task.name)}</h3>
        ${task.due ? `<div class="small-text">due ${fmtDate(task.due)}</div>` : ''}
        <div class="row" style="margin-top:1rem;">
          <button class="primary" onclick="markFocusDone()">done</button>
          <button onclick="skipFocus()">skip</button>
        </div>
      </div>
      <div class="card">
        <div class="timer-display" id="focus-timer">25:00</div>
        <div class="row" style="justify-content:center;">
          <button onclick="startFocusTimer(25)">focus 25</button>
          <button onclick="startFocusTimer(5)">break 5</button>
          <button onclick="stopFocusTimer()">stop</button>
        </div>
      </div>
    ` : `<div class="empty-msg">nothing urgent — you're free! 🎉</div>`}
  `;
}
