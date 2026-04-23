// assets/js/ui/skeleton.js
// Reusable skeleton loading components.
// Dashboard already has a custom skeleton; this module provides
// reusable table-row skeletons for CRUD list views.

/**
 * Returns HTML for N skeleton table rows.
 * @param {number} [count=5] — Number of skeleton rows
 * @returns {string} HTML string of <tr> elements with animated bars
 */
export function skeletonRows(count = 5) {
  return Array.from({ length: count }, () => `
    <tr class="animate-pulse">
      <td class="px-4 py-3"><div class="h-4 bg-stone-200 rounded w-3/4"></div></td>
      <td class="px-4 py-3"><div class="h-4 bg-stone-200 rounded w-1/2"></div></td>
      <td class="px-4 py-3"><div class="h-4 bg-stone-200 rounded w-1/3"></div></td>
      <td class="px-4 py-3"><div class="h-4 bg-stone-200 rounded w-20"></div></td>
    </tr>
  `).join('');
}

/**
 * Returns an HTML string for a full-page loading skeleton.
 * Useful for views that load data before rendering anything.
 * @returns {string} HTML string
 */
export function skeletonPage() {
  return `
    <div class="p-6 space-y-6 animate-pulse">
      <div class="h-8 w-48 bg-stone-200 rounded"></div>
      <div class="bg-white rounded-xl shadow-sm p-5 space-y-4">
        ${Array.from({ length: 4 }, () => `
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-stone-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-stone-200 rounded w-1/3"></div>
              <div class="h-3 bg-stone-200 rounded w-1/2"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
