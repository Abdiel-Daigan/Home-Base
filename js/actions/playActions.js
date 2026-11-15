// ============================================================
// ACTIONS — game library, image editor, play sessions
// ============================================================
import { state, saveState } from '../core/storage.js';
import { nowISO } from '../core/utils.js';
import { render } from '../core/router.js';
import { TAG_OPTIONS } from '../core/constants.js';
import { getFormState, resetForm } from '../views/playtracking.js';

const COVER_W = 320;
const COVER_H = 180;

/* ============================================================
   CREATE / EDIT GAME MODAL
============================================================ */
export function openGameCreate() {
  resetForm();
  window._editorState = {
    image: null, zoom: 1, baseScale: 1,
    offsetX: 0, offsetY: 0, dragging: false, lastX: 0, lastY: 0,
  };
  const hint = document.getElementById('editor-hint');
  if (hint) hint.style.display = '';
  const canvas = document.getElementById('editor-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, COVER_W, COVER_H);
    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, COVER_W, COVER_H);
  }

  document.getElementById('game-modal-title').textContent = 'add game';
  document.getElementById('game-name').value = '';
  document.getElementById('game-hours').value = '0';
  document.getElementById('game-mins').value = '0';
  document.querySelectorAll('.tag-chip').forEach(b => b.classList.remove('selected'));

  const uploader = document.querySelector('#game-modal .cover-uploader');
  if (uploader) uploader.innerHTML = `<div class="cover-placeholder">＋<br><span class="small-text">cover</span></div>`;

  document.getElementById('game-modal').classList.remove('hidden');
}

export function openGameEdit(index) {
  const g = state.games[index];
  if (!g) return;

  resetForm();
  const f = getFormState();
  f.editingIndex = index;
  f.tags = new Set(g.tags || []);
  f.imageData = g.image || null;
  f.hoursPlayed = Math.floor((g.manualMinutes || 0) / 60);
  f.minutesPlayed = (g.manualMinutes || 0) % 60;

  window._editorState = {
    image: null, zoom: 1, baseScale: 1,
    offsetX: 0, offsetY: 0, dragging: false, lastX: 0, lastY: 0,
  };
  const hint = document.getElementById('editor-hint');
  if (hint) hint.style.display = '';
  const canvas = document.getElementById('editor-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, COVER_W, COVER_H);
    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, COVER_W, COVER_H);
  }

  document.getElementById('game-modal-title').textContent = 'edit game';
  document.getElementById('game-name').value = g.name;
  document.getElementById('game-hours').value = String(f.hoursPlayed);
  document.getElementById('game-mins').value = String(f.minutesPlayed);

  const row = document.getElementById('tag-chip-row');
  row.innerHTML = TAG_OPTIONS.map(t => `
    <button type="button"
            class="tag-chip ${f.tags.has(t) ? 'selected' : ''}"
            data-tag="${t}"
            onclick="toggleTagChip('${t}')">${t}</button>
  `).join('');

  const uploader = document.querySelector('#game-modal .cover-uploader');
  if (uploader) {
    uploader.innerHTML = f.imageData
      ? `<img src="${f.imageData}" alt="cover">`
      : `<div class="cover-placeholder">＋<br><span class="small-text">cover</span></div>`;
  }

  document.getElementById('game-modal').classList.remove('hidden');
}

export function closeGameModal() {
  document.getElementById('game-modal').classList.add('hidden');
}

export function toggleTagChip(tag) {
  const f = getFormState();
  if (f.tags.has(tag)) f.tags.delete(tag);
  else f.tags.add(tag);

  document.querySelectorAll('.tag-chip').forEach(btn => {
    if (btn.dataset.tag === tag) {
      btn.classList.toggle('selected', f.tags.has(tag));
    }
  });
}

export function saveGame() {
  const f = getFormState();
  const nameInput = document.getElementById('game-name');
  const name = (nameInput?.value || '').trim();

  if (!name) return alert('please enter a game name');
  if (state.games.some((g, i) => i !== f.editingIndex && g.name.toLowerCase() === name.toLowerCase())) {
    return alert('a game with that name is already in your library');
  }
  if (f.tags.size === 0) return alert('pick at least one tag');

  const hours = Math.max(0, parseInt(document.getElementById('game-hours').value || '0', 10) || 0);
  const mins = Math.max(0, Math.min(59, parseInt(document.getElementById('game-mins').value || '0', 10) || 0));
  const manualMinutes = hours * 60 + mins;

  if (f.editingIndex !== null) {
    const g = state.games[f.editingIndex];
    g.name = name;
    g.tags = [...f.tags];
    g.image = f.imageData || null;
    g.manualMinutes = manualMinutes;
  } else {
    state.games.push({
      name,
      tags: [...f.tags],
      image: f.imageData || null,
      manualMinutes,
    });
  }
  saveState();
  resetForm();
  closeGameModal();
  render();
}

export function deleteGame(index) {
  const g = state.games[index];
  if (!g) return;
  if (!confirm(`delete "${g.name}" from the library?`)) return;
  state.games.splice(index, 1);
  saveState();
  resetForm();
  closeGameModal();
  render();
}

/* ============================================================
   IMAGE EDITOR
============================================================ */
window._editorState = {
  image: null, zoom: 1, baseScale: 1,
  offsetX: 0, offsetY: 0, dragging: false, lastX: 0, lastY: 0,
};

export function openImageEditor() {
  document.getElementById('image-editor').classList.remove('hidden');
  if (window._editorState.image) {
    document.getElementById('editor-hint').style.display = 'none';
    requestAnimationFrame(drawEditor);
  }
  wireEditorDrag();
}

export function closeImageEditor() {
  document.getElementById('image-editor').classList.add('hidden');
}

export function loadEditorImage(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const es = window._editorState;
      es.image = img;
      const scale = Math.min(COVER_W / img.width, COVER_H / img.height);
      es.zoom = 1;
      es.baseScale = scale;
      es.offsetX = (COVER_W - img.width * scale) / 2;
      es.offsetY = (COVER_H - img.height * scale) / 2;
      document.getElementById('editor-zoom').value = '1';
      document.getElementById('editor-hint').style.display = 'none';
      drawEditor();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function updateEditorZoom(val) {
  const es = window._editorState;
  if (!es.image) return;
  es.zoom = parseFloat(val);
  drawEditor();
}

export function resetEditorView() {
  const es = window._editorState;
  if (!es.image) return;
  es.zoom = 1;
  const scale = Math.min(COVER_W / es.image.width, COVER_H / es.image.height);
  es.baseScale = scale;
  es.offsetX = (COVER_W - es.image.width * scale) / 2;
  es.offsetY = (COVER_H - es.image.height * scale) / 2;
  document.getElementById('editor-zoom').value = '1';
  drawEditor();
}

export function drawEditor() {
  const es = window._editorState;
  const canvas = document.getElementById('editor-canvas');
  if (!canvas || !es.image) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, COVER_W, COVER_H);
  ctx.fillStyle = '#0b0d10';
  ctx.fillRect(0, 0, COVER_W, COVER_H);

  ctx.save();
  ctx.translate(COVER_W / 2, COVER_H / 2);
  ctx.scale(es.zoom, es.zoom);
  ctx.translate(-COVER_W / 2, -COVER_H / 2);

  ctx.drawImage(
    es.image,
    es.offsetX,
    es.offsetY,
    es.image.width * es.baseScale,
    es.image.height * es.baseScale
  );
  ctx.restore();
}

// BUG FIX: Removed the dataset check so listeners are cleanly attached every time
export function wireEditorDrag() {
  const canvas = document.getElementById('editor-canvas');
  if (!canvas) return;
  
  // Create a fresh clone to strip old listeners, preventing duplicates
  const newCanvas = canvas.cloneNode(true);
  canvas.parentNode.replaceChild(newCanvas, canvas);

  const es = window._editorState;
  const start = (e) => {
    if (!es.image) return;
    es.dragging = true;
    const p = pointerPos(newCanvas, e);
    es.lastX = p.x; es.lastY = p.y;
    newCanvas.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!es.dragging) return;
    const p = pointerPos(newCanvas, e);
    const dx = p.x - es.lastX;
    const dy = p.y - es.lastY;
    es.offsetX += dx / es.zoom;
    es.offsetY += dy / es.zoom;
    es.lastX = p.x; es.lastY = p.y;
    drawEditor();
  };
  const end = () => { es.dragging = false; };

  newCanvas.addEventListener('pointerdown', start);
  newCanvas.addEventListener('pointermove', move);
  newCanvas.addEventListener('pointerup', end);
  newCanvas.addEventListener('pointercancel', end);
  newCanvas.addEventListener('pointerleave', end);
}

function pointerPos(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}

export function applyEditorImage() {
  const es = window._editorState;
  if (!es.image) return alert('choose an image first');

  const canvas = document.getElementById('editor-canvas');
  const data = canvas.toDataURL('image/jpeg', 0.8);

  const f = getFormState();
  f.imageData = data;

  const uploader = document.querySelector('#game-modal .cover-uploader');
  if (uploader) uploader.innerHTML = `<img src="${data}" alt="cover">`;

  closeImageEditor();
}

/* ============================================================
   PLAY SESSIONS
============================================================ */
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

/* ---- inline handler bindings ---- */
window.openGameCreate = openGameCreate;
window.openGameEdit = openGameEdit;
window.closeGameModal = closeGameModal;
window.toggleTagChip = toggleTagChip;
window.saveGame = saveGame;
window.deleteGame = deleteGame;
window.openImageEditor = openImageEditor;
window.closeImageEditor = closeImageEditor;
window.loadEditorImage = loadEditorImage;
window.updateEditorZoom = updateEditorZoom;
window.resetEditorView = resetEditorView;
window.applyEditorImage = applyEditorImage;
window.stopPlaying = stopPlaying;
window.editSessionEnd = editSessionEnd;
window.addFinish = addFinish;
window.removeFinish = removeFinish;
