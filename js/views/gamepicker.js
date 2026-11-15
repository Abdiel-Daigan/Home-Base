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
        <div class="row" style="margin-top:0.8rem; flex-wrap:wrap;
