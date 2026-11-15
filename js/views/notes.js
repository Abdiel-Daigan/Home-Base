// ============================================================
// VIEW — Quick notes
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML } from '../core/utils.js';
import '../actions/noteActions.js';

export function renderNotes(root) {
  root.innerHTML = `
    ${backButton()}
    <h2>📝 quick notes</h2>
    <div class="card">
      <div class="row">
        <input id="note-text" placeholder="quick thought..." style="flex:2;">
        <input id="note-tags" placeholder="tags (comma separated)" style="flex:1;">
        <button class="primary" onclick="addNote()">add</button>
      </div>
      <div class="row" style="margin-top:0.6rem;">
        <input id="note-search" placeholder="search notes..." style="flex:1;" oninput="renderNotesList()">
      </div>
    </div>
    <div id="notes-list"></div>
  `;
  window.renderNotesList();
}

window.renderNotesList = function () {
  const search = (document.getElementById('note-search')?.value || '').toLowerCase();
  const filtered = state.notes.filter(n =>
    !search ||
    n.text.toLowerCase().includes(search) ||
    (n.tags || '').toLowerCase().includes(search)
  );
  const list = document.getElementById('notes-list');
  if (!list) return;
  list.innerHTML = filtered.length === 0
    ? '<div class="empty-msg">no notes yet 📝</div>'
    : filtered.map(n => `
      <div class="card flex-between">
        <div>
          <div>${escapeHTML(n.text)}</div>
          ${n.tags ? `<span class="tag">${escapeHTML(n.tags)}</span>` : ''}
        </div>
        <button class="small danger" onclick="deleteNote('${n.id}')">✕</button>
      </div>
    `).join('');
};
