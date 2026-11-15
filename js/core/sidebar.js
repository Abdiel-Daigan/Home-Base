// ============================================================
// SIDEBAR — burger toggle, overlay, active link
// Burger itself moves to the sidebar's top-right when open.
// ============================================================
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('sidebar-overlay');
const burger   = document.getElementById('burger-btn');

export function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  sidebar.setAttribute('aria-hidden', 'false');
  document.body.classList.add('sidebar-open');
}

export function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  sidebar.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('sidebar-open');
}

export function toggleSidebar() {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
}

export function highlightActive(page) {
  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

export function initSidebar() {
  burger.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (a.dataset.page) window.navigate(a.dataset.page);
      closeSidebar();
    });
  });
}
