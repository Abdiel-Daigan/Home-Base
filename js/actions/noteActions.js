// ============================================================
// ACTIONS — note mutations
// ============================================================
import { state, saveState } from '../core/storage.js';
import { uid } from '../core/utils.js';

export function addNote() {
  const text = document.getElementById('note-text').value.trim();
  const tags = document.getElementById('note-tags').value.trim();
  if (!text) return;
  state.notes.push({ id: uid(), text, tags });
  saveState();
  // clear inputs and re-render list only
  document.getElementById('note-text').value = '';
  document.getElementById('note-tags').value = '';
  window.renderNotesList();
}

export function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  saveState();
  window.renderNotesList();
}

window.addNote = addNote;
window.deleteNote = deleteNote;
