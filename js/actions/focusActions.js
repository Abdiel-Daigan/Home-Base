// ============================================================
// ACTIONS — focus mutations + pomodoro timer
// ============================================================
import { state, saveState } from '../core/storage.js';
import { uid } from '../core/utils.js';
import { render } from '../core/router.js';
import {
  getMostUrgentTask,
  focusTimerInterval,
  setFocusTimer,
  stopFocusTimer,
  updateTimerDisplay,
  focusSecondsLeft,
} from '../views/focus.js';

export function markFocusDone() {
  const task = getMostUrgentTask();
  if (!task) return;
  if (task.type === 'todo') {
    const t = state.todos.find(t => t.id === task.id);
    if (t) t.done = true;
  } else {
    const a = state.assignments.find(a => a.id === task.id);
    if (a?.substeps) a.substeps.forEach(s => s.done = true);
    else if (a) a.substeps = [{ id: uid(), name: 'completed', done: true }];
  }
  saveState();
  render();
}

export function skipFocus() {
  if (!window._focusSkips) window._focusSkips = new Set();
  const task = getMostUrgentTask();
  if (task) window._focusSkips.add(task.id);
  render();
}

export function startFocusTimer(minutes) {
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  setFocusTimer(null, minutes * 60);
  updateTimerDisplay();
  const interval = setInterval(() => {
    // read module state via re-import isn't reliable; use closure-safe pattern:
    // simplest: keep seconds in a local, mirror to module via setFocusTimer each tick
    const next = (window._focusSeconds ?? minutes * 60) - 1;
    window._focusSeconds = next;
    // fallback
    if (next <= 0) {
      clearInterval(interval);
      setFocusTimer(null, 25 * 60);
      alert('⏰ timer finished!');
      return;
    }
    // reflect into DOM directly
    const el = document.getElementById('focus-timer');
    if (el) {
      const m = Math.floor(next / 60);
      const s = next % 60;
      el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }, 1000);
  window._focusSeconds = minutes * 60;
  window._focusInterval = interval;
  // register so stopFocusTimer can clear it
  window.stopFocusTimer = () => {
    clearInterval(window._focusInterval);
    window._focusSeconds = 25 * 60;
    const el = document.getElementById('focus-timer');
    if (el) el.textContent = '25:00';
  };
  window.stopFocusTimerRef = window.stopFocusTimer;
}

// Expose
window.markFocusDone = markFocusDone;
window.skipFocus = skipFocus;
window.startFocusTimer = startFocusTimer;
