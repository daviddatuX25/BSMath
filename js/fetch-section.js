/**
 * fetch-section.js — shared helper for client pages
 * Fetches JSON from a public API endpoint and renders it.
 */

function fetchSection(apiUrl, renderFn) {
  var container = document.getElementById('content');
  container.innerHTML = '<div class="loading">Loading...</div>';

  fetch(apiUrl)
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    })
    .then(function(data) {
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-state">No items found.</div>';
        return;
      }
      container.innerHTML = renderFn(data);
    })
    .catch(function(err) {
      container.innerHTML = '<div class="error-state">Failed to load data. Please try again later.</div>';
      console.error('Fetch error:', err);
    });
}