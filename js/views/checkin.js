// ============================================================
// VIEW — Daily check-in
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML, fmtDate } from '../core/utils.js';
import '../actions/checkinActions.js';

export function renderCheckin(root) {
  const today = new Date().toISOString().slice(0, 10);
  const todays = state.checkins.find(c => c.date === today);
  const weekDue = state.assignments.filter(a => {
    const d = new Date(a.due);
    return d >= new Date() && d <= new Date(Date.now() + 7 * 24 * 3600 * 1000);
  });

  root.innerHTML = `
    ${backButton()}
    <h2>📅 daily check-in</h2>
    <div class="card">
      <h3>morning · what's due this week</h3>
      ${weekDue.length === 0 ? '<p class="empty-msg">nothing due this week 🍃</p>' :
        weekDue.map(a => `<div class="history-item">${escapeHTML(a.name)} — ${fmtDate(a.due)}</div>`).join('')}
      <div style="margin-top:1rem;">
        <label>my plan for today</label><br>
        <textarea id="morning-plan" rows="3" style="width:100%; margin-top:0.3rem;">${todays?.plan || ''}</textarea>
        <button class="primary small" style="margin-top:0.5rem;" onclick="saveMorningPlan()">save plan</button>
      </div>
    </div>
    <div class="card">
      <h3>evening · what did i get done?</h3>
      <div>
        ${state.todos.filter(t => t.done).map(t =>
          `<label><input type="checkbox" checked disabled> ${escapeHTML(t.text)}</label><br>`
        ).join('') || '<p class="empty-msg">no completed tasks yet</p>'}
      </div>
      <button class="small" style="margin-top:0.5rem;" onclick="saveEveningCheckin()">save check-in</button>
    </div>
    <div class="card">
      <h3>recent check-ins</h3>
      ${state.checkins.slice(-5).reverse().map(c => `
        <div class="history-item">
          <strong>${c.date}</strong> — plan: ${escapeHTML(c.plan || '—')}<br>
          done: ${(c.doneItems || []).join(', ') || '—'}
        </div>
      `).join('') || '<div class="empty-msg">no check-ins yet</div>'}
    </div>
  `;
}
