// ============================================================
// ACTIONS — play sessions + game library + image editor
// ============================================================
import { state, saveState } from '../core/storage.js';
import { nowISO, uid, escapeHTML } from '../core/utils.js';
import { render } from '../core/router.js';
import { getFormState, resetForm } from '../views/playtracking.js';

// ---- cover spec ----
const COVER_W = 320;
const COVER_H = 180;

/* ============================================================
   GAME LIBRARY
============================================================ */
export function toggleTagChip(tag) {
  const f = getFormState();
  if (f.tags.has(tag)) f.tags.delete(tag);
  else f.tags.add(tag);

  // update the chip's class in place (no full re-render)
  document.querySelectorAll('.tag-chip').forEach(btn => {
    if (btn.dataset.tag === tag) {
      btn.classList.toggle('selected', f.tags.has(tag));
    }
  });
}

export function addGame() {
  const nameInput = document.getElementById('game-name');
  const name = (nameInput?.value || '').trim();
  const f = getFormState();

  if (!name) return alert('please enter a game name');
  if (state.games.some(g => g.name.toLowerCase() === name.toLowerCase())) {
    return alert('a game with that name is already in your library');
  }
  if (f.tags.size === 0) {
    return alert('pick at least one tag so the mood picker can find it');
  }

  state.games.push({
    name,
    tags: [...f.tags],
    image: f.imageData || null,
  });
  saveState();

  // clear the form and re-render
  resetForm();
  if (nameInput) nameInput.value = '';
  render();
}

export function deleteGame(index) {
  if (!confirm('remove this game from the library?')) return;
  state.games.splice(index, 1);
  saveState();
  render();
}

/* ============================================================
   IMAGE EDITOR — crop/zoom a square-ish source into 320×180
============================================================ */
// Loaded image + view state live in a window-scoped object so
// the canvas redraws keep working across renders.
window._editorState = {
  image: null,     // HTMLImageElement
  zoom: 1,
  offsetX: 0,      // px offset of the image's top-left within the canvas, pre-zoom
  offsetY: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
};

export function openImageEditor() {
  document.getElementById('image-editor').classList.remove('hidden');
  // if there's already a chosen image, draw it
  if (window._editorState.image) requestAnimationFrame(drawEditor);
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
      // center the image and fit it inside the canvas
      const scale = Math.min(COVER_W / img.width, COVER_H / img.height);
      es.zoom = 1;
      // store a "base scale" used when rendering
      es.baseScale = scale;
      // center: offset in canvas space after base scale
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
  // zoom is applied around the canvas center
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

  // dark background so empty areas read as "not part of the image"
  ctx.fillStyle = '#0b0d10';
  ctx.fillRect(0, 0, COVER_W, COVER_H);

  ctx.save();
  // zoom around center
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

export function wireEditorDrag() {
  const canvas = document.getElementById('editor-canvas');
  if (!canvas || canvas.dataset.dragWired) return;
  canvas.dataset.dragWired = '1';

  const es = window._editorState;
  const start = (e) => {
    if (!es.image) return;
    es.dragging = true;
    const p = pointerPos(canvas, e);
    es.lastX = p.x; es.lastY = p.y;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!es.dragging) return;
    const p = pointerPos(canvas, e);
    const dx = p.x - es.lastX;
    const dy = p.y - es.lastY;
    es.offsetX += dx / es.zoom;
    es.offsetY += dy / es.zoom;
    es.lastX = p.x; es.lastY = p.y;
    drawEditor();
  };
  const end = () => { es.dragging = false; };

  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', end);
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

  // close modal, swap the preview and button label without full re-render
  closeImageEditor();
  const uploader = document.querySelector('.cover-uploader');
  if (uploader) {
    uploader.innerHTML = `<img src="${data}" alt="cover">`;
  }
  const changeBtn = [...document.querySelectorAll('button')]
    .find(b => /add cover|change cover/.test(b.textContent));
  if (changeBtn) changeBtn.textContent = 'change cover';
}

/* ============================================================
   PLAY SESSIONS (unchanged behaviour)
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

/* ---- inline-handler bindings ---- */
window.toggleTagChip = toggleTagChip;
window.addGame = addGame;
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
