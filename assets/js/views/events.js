// assets/js/views/events.js
// CRUD view for Events. Mirrors announcements.js so patterns stay consistent.
// Called by router.js when navigating to #/events.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';
import { emptyState } from '../ui/empty-state.js';
import { skeletonRows } from '../ui/skeleton.js';

let _items = []; // local cache, refreshed from API on load and after every mutation

export async function loadEvents() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderHeader() + `<table class="w-full text-sm"><tbody>${skeletonRows(5)}</tbody></table>`;
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('events/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load events: ${res.error || 'Unknown error'}</p>
            </div>`;
        return;
    }

    _items = res.data;
    canvas.innerHTML = renderPage(_items);
    attachEvents(canvas);
}

// ── Rendering ──────────────────────────────────────────────────────────

function renderHeader() {
    return `
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Events</h2>
                <button id="btn-add-event"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add Event
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">`;
}

function renderFooter() {
    return `</div></div>`;
}

function renderPage(items) {
    if (items.length === 0) {
        return renderHeader() + emptyState('event', 'No events yet', 'Add an event to the calendar.') + renderFooter();
    }
    return renderHeader() + renderTable(items) + renderFooter();
}

function renderTable(items) {
    return `
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-stone-50 border-b border-stone-200">
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Title</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Date</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden lg:table-cell">Location</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Status</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Author</th>
                    <th class="px-5 py-3 w-24"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((e, i) => `
                    <tr data-id="${e.id}" class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === items.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5">
                            <div class="font-medium text-stone-800">${escapeHtml(e.title)}</div>
                            ${e.description ? `<div class="text-stone-400 text-xs mt-0.5 truncate max-w-md">${escapeHtml(truncate(e.description, 80))}</div>` : ''}
                        </td>
                        <td class="px-5 py-3.5 hidden md:table-cell text-stone-600">
                            ${e.event_date ? formatDate(e.event_date) : '—'}
                            ${e.event_time ? `<div class="text-xs text-stone-400">${formatTime(e.event_time)}</div>` : ''}
                        </td>
                        <td class="px-5 py-3.5 hidden lg:table-cell text-stone-500">${e.location ? escapeHtml(e.location) : '—'}</td>
                        <td class="px-5 py-3.5">${statusBadge(e.status)}</td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell">${escapeHtml(e.author_name)}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button data-action="edit" data-id="${e.id}"
                                    class="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                                    title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button data-action="delete" data-id="${e.id}"
                                    class="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                    title="Delete">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

function statusBadge(status) {
    const colors = {
        pending:  'bg-amber-50 text-amber-700',
        approved: 'bg-emerald-50 text-emerald-700',
        rejected: 'bg-red-50 text-red-700',
    };
    return `<span class="px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.pending}">${status}</span>`;
}

// ── Event wiring ───────────────────────────────────────────────────────

function attachEvents(canvas) {
    canvas.querySelector('#btn-add-event')?.addEventListener('click', openAddModal);

    canvas.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id   = parseInt(btn.dataset.id, 10);
        const item = _items.find((x) => x.id === id);
        if (!item) return;

        if (btn.dataset.action === 'edit')   openEditModal(item);
        if (btn.dataset.action === 'delete') openDeleteModal(item);
    });
}

// ── Modals ─────────────────────────────────────────────────────────────

function openAddModal() {
    modal.openForm({
        title: 'Add Event',
        fields: [
            { name: 'title',       label: 'Title',       type: 'text',     required: true,  placeholder: 'e.g. Math Department Assembly' },
            { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'What is this event about?' },
            { name: 'event_date',  label: 'Event Date',  type: 'date',     required: true  },
            { name: 'event_time',  label: 'Event Time',  type: 'time',     required: false },
            { name: 'location',    label: 'Location',    type: 'text',     required: false, placeholder: 'e.g. Auditorium' },
        ],
        submitLabel: 'Add Event',
        onSubmit: async (data) => {
            const res = await api.post('events/store.php', data);
            if (!res.success) throw new Error(res.error || 'Failed to add event');
            modal.close();
            toast.show('Event added (pending approval)', 'success');
            await refresh();
        },
    });
}

function openEditModal(item) {
    modal.openForm({
        title: 'Edit Event',
        fields: [
            { name: 'title',       label: 'Title',       type: 'text',     required: true,  value: item.title },
            { name: 'description', label: 'Description', type: 'textarea', required: false, value: item.description || '' },
            { name: 'event_date',  label: 'Event Date',  type: 'date',     required: true,  value: item.event_date || '' },
            { name: 'event_time',  label: 'Event Time',  type: 'time',     required: false, value: item.event_time ? item.event_time.slice(0, 5) : '' },
            { name: 'location',    label: 'Location',    type: 'text',     required: false, value: item.location || '' },
        ],
        submitLabel: 'Save Changes',
        onSubmit: async (data) => {
            const res = await api.post('events/update.php', { id: item.id, ...data });
            if (!res.success) throw new Error(res.error || 'Failed to update event');
            modal.close();
            toast.show('Event updated', 'success');
            await refresh();
        },
    });
}

function openDeleteModal(item) {
    modal.open({
        title:        'Delete Event',
        body:         `Are you sure you want to delete "${escapeHtml(item.title)}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('events/destroy.php', { id: item.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete event', 'error');
                return;
            }
            toast.show('Event deleted', 'success');
            await refresh();
        },
    });
}

// ── Helpers ────────────────────────────────────────────────────────────

// Minimal HTML escape — prevents stored XSS when a title/description contains tags.
function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function truncate(s, n) {
    const str = String(s ?? '');
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function formatDate(dateStr) {
    // Convert "2026-05-10" → "May 10, 2026"
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00'); // force local-time parse
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
    // Convert "09:00:00" → "9:00 AM"
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function renderSkeleton() {
    return `
        <div class="p-6 space-y-4 animate-pulse">
            <div class="flex justify-between items-center">
                <div class="h-8 w-36 bg-stone-200 rounded"></div>
                <div class="h-9 w-32 bg-stone-200 rounded-lg"></div>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                ${Array(3).fill('<div class="h-14 bg-stone-100 border-b border-stone-200"></div>').join('')}
            </div>
        </div>`;
}

/**
 * Filter table rows by search term.
 * @param {string} term — lowercase search term
 */
export function filterRows(term) {
    const rows = document.querySelectorAll('#main-content tr[data-id]');
    if (!term) {
        rows.forEach(r => r.style.display = '');
        return;
    }
    rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}