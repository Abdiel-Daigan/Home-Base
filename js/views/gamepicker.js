// ============================================================
// VIEW — Mood-based game picker
// ============================================================
import { state } from '../core/storage.js';
import { backButton, escapeHTML } from '../core/utils.js';
import '../actions/gameActions.js';

export const MOOD_TAGS = {
  'Cozy and calm': ['cozy', 'relaxing', 'farming', 'casual'],
  'Hyped and energetic': ['intense', 'action', 'fast', 'competitive'],
  'Want a story': ['story-heavy', 'narrative', 'rpg', 'adventure'],
  'Want to think': ['puzzle', 'strategy', 'tactical', 'brain'],
  'Only have a little time': ['short-session', 'casual', 'arcade'],
  'Brain off': ['brain-off', 'relaxing', 'casual', 'idle'],
  'Surprise me': [],
};

export const pickerSession = {
  mood: null,
  redraws: 0,
  drawn: [],
  timeFilter30: false,
};

export function renderGamePicker(root) {
  const { mood, redraws, drawn } = pickerSession;

  root.innerHTML = `
    ${backButton()}
    <h2>🎮 mood game picker</h2>

    ${!mood ? `
      <div class="card">
        <h3>how do you feel?</h3>
        <div class="row" style="margin-top:0.8rem; flex-wrap:wrap; gap:0.5rem;">
          ${Object.keys(MOOD_TAGS).map(m => `
            <button class="mood-btn" onclick="pickMood('${escapeHTML(m)}')">${escapeHTML(m)}</button>
          `).join('')}
        </div>
        <hr>
        <label>
          <input type="checkbox" ${pickerSession.timeFilter30 ? 'checked' : ''}
                 onchange="pickerSession.timeFilter30 = this.checked">
          I only have 30 minutes (favours short-session games)
        </label>
        <div style="margin-top:1rem;">
          <button onclick="roulette()">🎲 roulette — pick for me</button>
        </div>
      </div>
    ` : `
      <div class="card">
        <div class="flex-between">
          <div><strong>mood:</strong> ${escapeHTML(mood)}</div>
          <button class="small" onclick="resetPicker()">change mood</button>
        </div>
        ${drawn.length === 0 ? `
          <div class="deck" onclick="drawGames()">
            <div style="font-size:3rem;">🃏</div>
            <p>tap to draw 3 games</p>
          </div>
        ` : `
          <div style="margin-top:1rem;">
            ${drawn.map(g => `
              <div class="game-card game-card-drawn">
                ${g.image ? `<img src="${g.image}" alt="">` : ''}
                <div style="flex:1;">
                  <strong>${escapeHTML(g.name)}</strong>
                  <div class="small-text" style="margin-top:0.2rem;">${(g.tags || []).join(', ')}</div>
                </div>
                <button class="small primary" onclick="playGame('${escapeHTML(g.name)}')">play this</button>
              </div>
            `).join('')}
          </div>
          <div class="row" style="margin-top:0.8rem;">
            <button class="small" ${redraws >= 2 ? 'disabled' : ''} onclick="redraw()">
              not tonight (${2 - redraws} left)
            </button>
          </div>
        `}
      </div>
    `}
  `;
  window.pickerSession = pickerSession;
}
