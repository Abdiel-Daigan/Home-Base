// ============================================================
// VIEW — Mood log
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML } from '../core/utils.js';

export function renderMoodLog(root) {
  const counts = {};
  const byWeekday = {};
  state.moodLog.forEach(m => {
    counts[m.mood] = (counts[m.mood] || 0) + 1;
    const wd = new Date(m.timestamp).toLocaleDateString([], { weekday: 'long' });
    byWeekday[wd] = (byWeekday[wd] || 0) + 1;
  });

  root.innerHTML = `
    ${backButton()}
    <h2>📊 mood log</h2>
    <div class="card">
      <h3>most picked moods</h3>
      ${Object.keys(counts).length === 0 ? '<div class="empty-msg">no moods logged yet</div>' :
        Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([m, c]) => `
          <div class="flex-between history-item"><span>${escapeHTML(m)}</span><span>${c}</span></div>
        `).join('')}
    </div>
    <div class="card">
      <h3>by weekday</h3>
      ${Object.keys(byWeekday).length === 0 ? '<div class="empty-msg">no data yet</div>' :
        Object.entries(byWeekday).map(([d, c]) => `
          <div class="flex-between history-item"><span>${d}</span><span>${c}</span></div>
        `).join('')}
    </div>
  `;
}
