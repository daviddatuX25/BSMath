// assets/js/ui/empty-state.js
// Reusable empty-state component for list views.
// Shows an icon, title, and optional subtitle when a list has zero items.

/**
 * Returns HTML for an empty-state placeholder.
 * @param {string} icon — Material Symbol name (e.g. 'inbox', 'event')
 * @param {string} title — Primary message (e.g. 'No programs yet')
 * @param {string} [subtitle] — Secondary message (e.g. 'Create your first program to get started.')
 * @returns {string} HTML string
 */
export function emptyState(icon, title, subtitle = '') {
  return `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-stone-400 text-[32px]">${icon}</span>
      </div>
      <p class="text-stone-700 font-semibold text-lg">${title}</p>
      ${subtitle ? `<p class="text-stone-400 text-sm mt-1 max-w-xs">${subtitle}</p>` : ''}
    </div>
  `;
}
