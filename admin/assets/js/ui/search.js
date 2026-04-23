// assets/js/ui/search.js
// Debounced global search — filters rows in the currently-mounted list view.

const DEBOUNCE_MS = 250;
let currentView = null; // set by router on each navigation

/**
 * Call this when the search input receives input.
 * Debounces by DEBOUNCE_MS, then filters visible rows.
 */
export function initSearch() {
  const input = document.getElementById('topbar-search');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => filterCurrentView(input.value.trim()), DEBOUNCE_MS);
  });
}

/**
 * Set which view module is currently mounted.
 * Called by router.js after each navigation.
 * @param {object} view — { name: string, filterRows: (term) => void }
 */
export function setActiveView(view) {
  currentView = view;
  // Clear search when navigating away
  const input = document.getElementById('topbar-search');
  if (input) input.value = '';
}

/**
 * Filter the current view using the provided search term.
 * Falls back to a simple text-content filter if the view
 * does not expose filterRows().
 */
function filterCurrentView(term) {
  if (!currentView) return;
  const lower = term.toLowerCase();
  if (typeof currentView.filterRows === 'function') {
    currentView.filterRows(lower);
    return;
  }
  const main = document.getElementById('main-content');
  if (!main) return;
  const rows = main.querySelectorAll('tr[data-id], .searchable-card');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(lower) ? '' : 'none';
  });
}
