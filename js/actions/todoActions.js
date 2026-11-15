// ============================================================
// ACTIONS — to-do mutations
// ============================================================
import { state, saveState } from '../core/storage.js';
import { uid } from '../core/utils.js';
import { render } from '../core/router.js';

export function addTodo() {
  const text = document.getElementById('todo-text').value.trim();
  const priority = document.getElementById('todo-priority').value;
  if (!text) return;
  state.todos.push({ id: uid(), text, priority, done: false });
  saveState();
  render();
}

export function toggleTodo(id) {
  const t = state.todos.find(t => t.id === id);
  if (t) { t.done = !t.done; saveState(); render(); }
}

export function deleteTodo(id) {
  state.todos = state.todos.filter(t => t.id !== id);
  saveState();
  render();
}

window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
