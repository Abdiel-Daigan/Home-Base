// ============================================================
// STORAGE — localStorage read/write for the whole app state
// ============================================================
const STORAGE_KEY = 'personal_hub_v1';

export const defaultState = {
  assignments: [],
  todos: [],
  notes: [],
  games: [],
  playSessions: [],
  moodLog: [],
  checkins: [],
  journal: [],
  finishList: [],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

// The single live state object. All modules import this and mutate it.
export const state = loadState();

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function replaceState(newState) {
  // wipe keys, then copy in new ones (keeps the same object reference)
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, structuredClone(defaultState), newState);
  saveState();
}
