// ============================================================
// STORAGE — localStorage read/write for the whole app state
// ============================================================
const STORAGE_KEY = 'personal_hub_v1';

export const defaultState = {
  assignments: [],
  todos: [],
  notes: [],
  games: [],        // [{ name, tags: [], image: dataURL|null }]
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

export const state = loadState();

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function replaceState(newState) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, structuredClone(defaultState), newState);
  saveState();
}
