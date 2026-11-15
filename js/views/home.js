// ============================================================
// VIEW — Home screen
// ============================================================
export function renderHome(root) {
  root.innerHTML = `
    <h1>personal hub</h1>
    <p style="color: var(--text-dim); margin-bottom: 1.5rem;">one calm place for everything</p>

    <div class="group-label">important stuff</div>
    <div class="grid-2">
      <div class="tile" onclick="navigate('deadlines')">
        <span class="icon">⏳</span><h3>deadlines</h3><p>track assignments and countdowns</p>
      </div>
      <div class="tile" onclick="navigate('todos')">
        <span class="icon">✅</span><h3>to-do list</h3><p>simple tasks with priorities</p>
      </div>
      <div class="tile" onclick="navigate('focus')">
        <span class="icon">🎯</span><h3>what now?</h3><p>one task + pomodoro timer</p>
      </div>
      <div class="tile" onclick="navigate('checkin')">
        <span class="icon">📅</span><h3>daily check-in</h3><p>morning plan & evening reflection</p>
      </div>
      <div class="tile" onclick="navigate('notes')">
        <span class="icon">📝</span><h3>quick notes</h3><p>capture thoughts with tags</p>
      </div>
    </div>

    <div class="group-label">things i love</div>
    <div class="grid-2">
      <div class="tile" onclick="navigate('gamepicker')">
        <span class="icon">🎮</span><h3>mood game picker</h3><p>draw 3 games based on how you feel</p>
      </div>
      <div class="tile" onclick="navigate('playtracking')">
        <span class="icon">⏱️</span><h3>play tracking</h3><p>log sessions & backlog progress</p>
      </div>
      <div class="tile" onclick="navigate('moodlog')">
        <span class="icon">📊</span><h3>mood log</h3><p>see your mood patterns</p>
      </div>
      <div class="tile" onclick="navigate('journal')">
        <span class="icon">🎨</span><h3>project journal</h3><p>art & game progress with images</p>
      </div>
      <div class="tile" onclick="navigate('data')">
        <span class="icon">💾</span><h3>data</h3><p>export / import all data</p>
      </div>
    </div>
  `;
}
