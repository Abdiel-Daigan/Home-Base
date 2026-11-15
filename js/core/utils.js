// ============================================================
// UTILS — small helpers used across the app
// ============================================================
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
         d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function nowISO() { return new Date().toISOString(); }

export function uid() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

// Back-home button used by every view
export function backButton() {
  return `<button class="back-home" onclick="navigate('home')">← home</button>`;
}

// Debounce helper (useful for search inputs)
export function debounce(fn, ms = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
