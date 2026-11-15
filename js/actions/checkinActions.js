// ============================================================
// ACTIONS — check-in mutations
// ============================================================
import { state, saveState } from '../core/storage.js';
import { render } from '../core/router.js';

export function saveMorningPlan() {
  const today = new Date().toISOString().slice(0, 10);
  const plan = document.getElementById('morning-plan').value;
  let c = state.checkins.find(c => c.date === today);
  if (!c) { c = { date: today, plan: '', doneItems: [] }; state.checkins.push(c); }
  c.plan = plan;
  saveState();
  render();
}

export function saveEveningCheckin() {
  const today = new Date().toISOString().slice(0, 10);
  let c = state.checkins.find(c => c.date === today);
  if (!c) { c = { date: today, plan: '', doneItems: [] }; state.checkins.push(c); }
  c.doneItems = state.todos.filter(t => t.done).map(t => t.text);
  saveState();
  render();
}

window.saveMorningPlan = saveMorningPlan;
window.saveEveningCheckin = saveEveningCheckin;
