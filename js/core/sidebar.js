// ============================================================
// SIDEBAR — burger toggle, overlay, close, active link
// ============================================================
const sidebar    = document.getElementById('sidebar');
const overlay    = document.getElementById('sidebar-overlay');
const burger     = document.getElementById('burger-btn');
const closeBtn   = document.getElementById('sidebar-close');

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
  if (sidebar.classList.contains('open')) closeSidebar();
  else openSidebar();
}

export function highlightActive(page) {
  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

export function initSidebar() {
  burger.addEventListener('click', toggleSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Link clicks navigate + close
  document.querySelectorAll('.sidebar-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const page = a.dataset.page;
      if (page) window.navigate(page);
      closeSidebar();
    });
  });
}
