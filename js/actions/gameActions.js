// ============================================================
// ACTIONS — game picker logic
// ============================================================
import { state, saveState } from '../core/storage.js';
import { nowISO, uid } from '../core/utils.js';
import { render } from '../core/router.js';
import { MOOD_TAGS, pickerSession } from '../views/gamepicker.js';

export function pickMood(mood) {
  pickerSession.mood = mood;
  pickerSession.redraws = 0;
  pickerSession.drawn = [];
  state.moodLog.push({ mood, timestamp: nowISO() });
  saveState();
  render();
}

export function resetPicker() {
  pickerSession.mood = null;
  pickerSession.redraws = 0;
  pickerSession.drawn = [];
  render();
}

export function drawGames() {
  if (!pickerSession.mood) return;
  if (state.games.length === 0) {
    alert('your game library is empty — add games in play tracking first');
    return;
  }
  const moodTags = MOOD_TAGS[pickerSession.mood] || [];
  const candidates = state.games.map(g => {
    const gTags = (g.tags || []).map(t => t.toLowerCase());
    const matches = moodTags.length === 0 || moodTags.some(t => gTags.includes(t));
    const last = state.playSessions
      .filter(s => s.gameName === g.name)
      .sort((a, b) => new Date(b.end || b.start) - new Date(a.end || a.start))[0];
    const days = last
      ? (Date.now() - new Date(last.end || last.start)) / 86400000
      : 999;
    let weight = 1 + Math.min(days, 365) / 30;
    if (pickerSession.timeFilter30 && gTags.includes('short-session')) weight *= 3;
    return { game: g, matches, weight };
  });

  let pool = candidates.filter(c => c.matches);
  if (pool.length < 3) {
    const picked = new Set(pool.map(p => p.game.name));
    pool = [...pool, ...candidates.filter(c => !picked.has(c.game.name))];
  }

  const drawn = [];
  const used = new Set();
  while (drawn.length < 3 && pool.length > 0) {
    const avail = pool.filter(p => !used.has(p.game.name));
    if (!avail.length) break;
    const total = avail.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    let chosen = avail[avail.length - 1];
    for (const p of avail) { r -= p.weight; if (r <= 0) { chosen = p; break; } }
    drawn.push(chosen.game);
    used.add(chosen.game.name);
  }

  pickerSession.drawn = drawn;
  render();
}

export function redraw() {
  if (pickerSession.redraws >= 2) return;
  pickerSession.redraws++;
  pickerSession.drawn = [];
  drawGames();
}

export function roulette() {
  const moods = Object.keys(MOOD_TAGS).filter(m => m !== 'Surprise me');
  pickMood(moods[Math.floor(Math.random() * moods.length)]);
  setTimeout(() => drawGames(), 50);
}

export function playGame(gameName) {
  const active = state.playSessions.find(s => !s.end);
  if (active) active.end = nowISO();
  state.playSessions.push({ id: uid(), gameName, start: nowISO(), end: null });
  saveState();
  render();
}

window.pickMood = pickMood;
window.resetPicker = resetPicker;
window.drawGames = drawGames;
window.redraw = redraw;
window.roulette = roulette;
window.playGame = playGame;
