// ============================================================
// ACTIONS — play session mutations
// ============================================================
import { state, saveState } from '../core/storage.js';
import { nowISO } from '../core/utils.js';
import { render } from '../core/router.js';

export function saveLibrary() {
  const raw = document.getElementById('library-input').value;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  state.games = lines.map(line => {
    const [name, tagStr] = line.split('|').map(s => s.trim());
    const tags = tagStr ? tagStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    return { name, tags };
  }).filter(g => g.name);
  saveState();
  render();
}

export function stopPlaying(sessionId) {
  const s = state.playSessions.find(s => s.id === sessionId);
  if (s) { s.end = nowISO(); saveState(); }
  render();
}

export function editSessionEnd(sessionId) {
  const s = state.playSessions.find(s => s.id === sessionId);
  if (!s) return;
  const v = prompt('new end time (ISO) or blank to clear:', s.end || '');
  if (v === null) return;
  s.end = v.trim() || null;
  saveState();
  render();
}

export function addFinish() {
  const name = document.getElementById('finish-name').value.trim();
  if (!name) return;
  state.finishList.push({ gameName: name });
  saveState();
  render();
}

export function removeFinish(i) {
  state.finishList.splice(i, 1);
  saveState();
  render();
}

window.saveLibrary = saveLibrary;
window.stopPlaying = stopPlaying;
window.editSessionEnd = editSessionEnd;
window.addFinish = addFinish;
window.removeFinish = removeFinish;
