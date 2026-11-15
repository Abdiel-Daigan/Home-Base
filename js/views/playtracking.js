  // Build page sidebar (right column)
  const sidebarHTML = `
    <aside class="page-sidebar">
      <div class="card" style="margin-bottom:0.8rem;">
        <h3 style="font-size:1rem;">recent sessions</h3>
        ${recentSessions.length === 0 ? '<div class="empty-msg">no sessions yet</div>' :
          recentSessions.map(s => `
            <div class="history-item">
              <strong>${escapeHTML(s.gameName)}</strong> — ${fmtDate(s.start)}
              ${s.end
                ? `→ ${Math.round((new Date(s.end) - new Date(s.start)) / 60000)}m
                   <button class="small" onclick="editSessionEnd('${s.id}')">edit</button>`
                : '· in progress'}
            </div>
          `).join('')}
      </div>
      <div class="card">
        <h3 style="font-size:1rem;">backlog progress</h3>
        <p class="small-text" style="margin-bottom:0.4rem;">games played this month</p>
        <div class="timer-display" style="font-size:1.8rem; margin:0.2rem 0;">${playedThisMonth.size}</div>
        <p class="small-text">out of ${state.games.length} in your library</p>
      </div>
    </aside>
  `;

  // Wrap in the new layout
  root.innerHTML = `
    <div class="library-layout">
      <div class="library-main">
        ${mainHTML}
      </div>
      ${sidebarHTML}
    </div>
  `;

  if (active) {
    playTick = setInterval(() => {
      const el = document.getElementById('play-timer');
      if (!el) return;
      const secs = Math.floor((Date.now() - new Date(active.start)) / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  if (window._editorState?.image) {
    requestAnimationFrame(drawEditor);
  }
}
