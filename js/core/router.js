// ============================================================
// ROUTER — decides which view renders based on currentPage
// ============================================================
import { highlightActive } from './sidebar.js';
import { refreshDock } from './dock.js';
import { renderHome } from '../views/home.js';
import { renderDeadlines } from '../views/deadlines.js';
import { renderTodos } from '../views/todos.js';
import { renderFocus, stopFocusTimer } from '../views/focus.js';
import { renderCheckin } from '../views/checkin.js';
import { renderNotes } from '../views/notes.js';
import { renderGamePicker } from '../views/gamepicker.js';
import { renderPlayTracking } from '../views/playtracking.js';
import { renderMoodLog } from '../views/moodlog.js';
import { renderJournal } from '../views/journal.js';
import { renderData } from '../views/data.js';


const routes = {
  home: renderHome,
  deadlines: renderDeadlines,
  todos: renderTodos,
  focus: renderFocus,
  checkin: renderCheckin,
  notes: renderNotes,
  gamepicker: renderGamePicker,
  playtracking: renderPlayTracking,
  moodlog: renderMoodLog,
  journal: renderJournal,
  data: renderData,
};

let currentPage = 'home';

export function getCurrentPage() { return currentPage; }

export function navigate(page) {
  // cleanup when leaving focus
  if (currentPage === 'focus' && page !== 'focus') {
    stopFocusTimer();
    window._focusSkips = new Set();
  }
  currentPage = routes[page] ? page : 'home';
  render();
}

export function render() {
  const fn = routes[currentPage] || renderHome;
  fn(document.getElementById('app'));
  highlightActive(currentPage);
  refreshDock();          // ← keeps the dock in sync
}

// Expose navigate globally so inline onclick="navigate('...')" works
window.navigate = navigate;
