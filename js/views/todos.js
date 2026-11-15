// ============================================================
// VIEW — To-do list
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML } from '../core/utils.js';
import '../actions/todoActions.js';

export function renderTodos(root) {
  const todos = state.todos || [];
  root.innerHTML = `
    ${backButton()}
    <h2>✅ to-do list</h2>
    <div class="card">
      <div class="row">
        <input id="todo-text" placeholder="what needs doing?" style="flex:2;">
        <select id="todo-priority">
          <option value="low">low</option>
          <option value="medium" selected>medium</option>
          <option value="high">high</option>
        </select>
        <button class="primary" onclick="addTodo()">add</button>
      </div>
    </div>
    <div>
      ${todos.length === 0 ? '<div class="empty-msg">no tasks yet — add one 🌿</div>' : ''}
      ${todos.map(t => `
        <div class="card flex-between">
          <label style="display:flex; gap:0.6rem; align-items:center;">
            <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo('${t.id}')">
            <span style="${t.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${escapeHTML(t.text)}</span>
            <span class="tag">${t.priority || 'medium'}</span>
          </label>
          <button class="small danger" onclick="deleteTodo('${t.id}')">✕</button>
        </div>
      `).join('')}
    </div>
  `;
}
