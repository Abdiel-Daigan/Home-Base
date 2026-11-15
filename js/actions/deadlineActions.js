// ============================================================
// ACTIONS — deadline mutations + notifications
// ============================================================
import { state, saveState } from '../core/storage.js';
import { uid, nowISO } from '../core/utils.js';
import { render } from '../core/router.js';

export function addAssignment() {
  const name = document.getElementById('dl-name').value.trim();
  const due = document.getElementById('dl-due').value;
  if (!name || !due) return alert('please enter a name and due date/time');
  state.assignments.push({ id: uid(), name, due, substeps: [] });
  saveState();
  render();
  requestNotificationPermission();
}

export function deleteAssignment(id) {
  if (!confirm('delete this assignment?')) return;
  state.assignments = state.assignments.filter(a => a.id !== id);
  saveState();
  render();
}

export function addSubstep(assignId) {
  const name = document.getElementById(`sub-${assignId}`).value.trim();
  const due = document.getElementById(`sub-due-${assignId}`).value;
  if (!name) return;
  const a = state.assignments.find(a => a.id === assignId);
  if (!a) return;
  (a.substeps ||= []).push({ id: uid(), name, due: due || null, done: false });
  saveState();
  render();
}

export function toggleSubstep(assignId, idx) {
  const a = state.assignments.find(a => a.id === assignId);
  if (!a?.substeps?.[idx]) return;
  a.substeps[idx].done = !a.substeps[idx].done;
  saveState();
  render();
}

export function deleteSubstep(assignId, idx) {
  const a = state.assignments.find(a => a.id === assignId);
  if (!a) return;
  a.substeps.splice(idx, 1);
  saveState();
  render();
}

// ---- notification permission + polling ----
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

const notified24 = new Set();
const notified1 = new Set();

export function startDeadlineNotifications() {
  setInterval(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    state.assignments.forEach(a => {
      const diffH = (new Date(a.due).getTime() - Date.now()) / (3600 * 1000);
      if (diffH > 23.9 && diffH < 24.1 && !notified24.has(a.id)) {
        new Notification('deadline in 24h', { body: a.name });
        notified24.add(a.id);
      }
      if (diffH > 0.9 && diffH < 1.1 && !notified1.has(a.id)) {
        new Notification('deadline in 1h', { body: a.name });
        notified1.add(a.id);
      }
    });
  }, 30000);
}

// Expose to window so inline handlers work
window.addAssignment = addAssignment;
window.deleteAssignment = deleteAssignment;
window.addSubstep = addSubstep;
window.toggleSubstep = toggleSubstep;
window.deleteSubstep = deleteSubstep;
