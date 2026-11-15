// ============================================================
// VIEW — Deadlines
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import { addAssignment, deleteAssignment, addSubstep, toggleSubstep, deleteSubstep } from '../actions/deadlineActions.js';

export function renderDeadlines(root) {
  const sorted = [...state.assignments].sort((a, b) => new Date(a.due) - new Date(b.due));

  const deadlineClass = (due) => {
    const diff = new Date(due).getTime() - Date.now();
    if (diff < 24 * 3600 * 1000) return 'deadline-red';
    if (diff < 3 * 24 * 3600 * 1000) return 'deadline-yellow';
    return 'deadline-green';
  };

  const countdown = (due) => {
    const diff = new Date(due).getTime() - Date.now();
    if (diff <= 0) return 'overdue';
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  root.innerHTML = `
    ${backButton()}
    <h2>⏳ deadlines</h2>
    <div class="card">
      <h3 style="margin-bottom:0.8rem;">add assignment</h3>
      <div class="row">
        <input id="dl-name" placeholder="assignment name" style="flex:2; min-width:160px;">
        <input id="dl-due" type="datetime-local" style="flex:1; min-width:170px;">
        <button class="primary" onclick="addAssignment()">add</button>
      </div>
    </div>
    <div>
      ${sorted.length === 0 ? '<div class="empty-msg">no assignments yet — add one above 🌱</div>' : ''}
      ${sorted.map(a => {
        const subSteps = a.substeps || [];
        return `
          <div class="card" style="border-left:4px solid var(--accent);">
            <div class="flex-between">
              <strong>${escapeHTML(a.name)}</strong>
              <span class="${deadlineClass(a.due)}">${countdown(a.due)} · ${fmtDate(a.due)}</span>
            </div>
            <div style="margin-top:0.4rem; font-size:0.85rem; color:var(--text-dim);">
              ${subSteps.map((s, i) => `
                <div class="flex-between" style="padding:0.2rem 0;">
                  <label>
                    <input type="checkbox" ${s.done ? 'checked' : ''} onchange="toggleSubstep('${a.id}', ${i})">
                    ${escapeHTML(s.name)}
                    <span class="small-text">${s.due ? fmtDate(s.due) : ''}</span>
                  </label>
                  <button class="small danger" onclick="deleteSubstep('${a.id}', ${i})">✕</button>
                </div>
              `).join('')}
            </div>
            <div class="row" style="margin-top:0.6rem;">
              <input id="sub-${a.id}" placeholder="sub-step name" style="flex:1; min-width:120px;">
              <input id="sub-due-${a.id}" type="datetime-local" style="flex:1; min-width:150px;">
              <button class="small" onclick="addSubstep('${a.id}')">+ sub-step</button>
              <button class="small danger" onclick="deleteAssignment('${a.id}')">delete</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
