// ============================================================
// VIEW — Project journal
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML } from '../core/utils.js';
import '../actions/journalActions.js';

export function renderJournal(root) {
  root.innerHTML = `
    ${backButton()}
    <h2>🎨 project journal</h2>
    <div class="card">
      <h3>add entry</h3>
      <div class="row"><input id="j-title" placeholder="title" style="flex:2;"></div>
      <div class="row" style="margin-top:0.5rem;">
        <input id="j-date" type="date" style="flex:1;">
        <input id="j-tags" placeholder="tags (comma separated)" style="flex:2;">
      </div>
      <textarea id="j-notes" rows="3" style="width:100%; margin-top:0.5rem;" placeholder="notes..."></textarea>
      <div class="row" style="margin-top:0.5rem;">
        <input type="file" id="j-image" accept="image/*" style="flex:1;">
        <button class="primary" onclick="addJournal()">save entry</button>
      </div>
    </div>
    <div class="card">
      <input id="j-search" placeholder="search by tag..." style="width:100%;" oninput="renderJournalList()">
    </div>
    <div id="journal-list" class="project-grid"></div>
  `;
  window.renderJournalList();
}

window.renderJournalList = function () {
  const search = (document.getElementById('j-search')?.value || '').toLowerCase();
  const entries = [...state.journal].reverse().filter(e =>
    !search || (e.tags || '').toLowerCase().includes(search)
  );
  const list = document.getElementById('journal-list');
  if (!list) return;
  list.innerHTML = entries.length === 0
    ? '<div class="empty-msg">no entries yet</div>'
    : entries.map(e => `
      <div class="project-card">
        ${e.image ? `<img src="${e.image}" alt="">` : ''}
        <strong>${escapeHTML(e.title)}</strong>
        <div class="small-text">${e.date || ''}</div>
        <div class="small-text">${escapeHTML(e.tags || '')}</div>
        <div style="font-size:0.85rem;">${escapeHTML(e.notes || '')}</div>
        <button class="small danger" onclick="deleteJournal('${e.id}')">delete</button>
      </div>
    `).join('');
};
