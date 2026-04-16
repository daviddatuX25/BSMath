// assets/js/views/approvals.js
// Dean approval workflow view. Called by router.js.
// DIFFERENT from CRUD views: no Add/Edit/Delete — only Approve/Reject.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';

let _items = [];
let _filter = ''; // '', 'announcements', 'events'

export async function loadApprovals() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderSkeleton();
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const endpoint = _filter
        ? `approvals/index.php?type=${_filter}`
        : 'approvals/index.php';
    const res = await api.get(endpoint);

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load pending items: ${res.error || 'Unknown error'}</p>
            </div>`;
        return;
    }

    _items = res.data;
    canvas.innerHTML = renderPage(_items);
    attachEvents(canvas);
}

// ── Rendering ──────────────────────────────────────────────────────────

function renderPage(items) {
    const counts = { all: _items.length, announcements: 0, events: 0 };
    // Recount from fresh data for tab badges
    items.forEach(i => {
        if (i.type === 'announcement') counts.announcements++;
        if (i.type === 'event') counts.events++;
    });

    return `
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Approve Content</h2>
            </div>

            <div class="flex gap-2">
                <button data-filter="" class="tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${_filter === '' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}">
                    All Pending <span class="ml-1 text-xs opacity-75">(${counts.all})</span>
                </button>
                <button data-filter="announcements" class="tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${_filter === 'announcements' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}">
                    Announcements <span class="ml-1 text-xs opacity-75">(${counts.announcements})</span>
                </button>
                <button data-filter="events" class="tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${_filter === 'events' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}">
                    Events <span class="ml-1 text-xs opacity-75">(${counts.events})</span>
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                ${items.length === 0 ? emptyState() : renderTable(items)}
            </div>
        </div>`;
}

function renderTable(items) {
    return `
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-stone-50 border-b border-stone-200">
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Type</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Title</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Author</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Submitted</th>
                    <th class="px-5 py-3 w-48"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item, i) => `
                    <tr class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === items.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5">${typeBadge(item.type)}</td>
                        <td class="px-5 py-3.5">
                            <div class="font-medium text-stone-800">${escapeHtml(item.title)}</div>
                            ${item.type === 'announcement'
                                ? `<div class="text-stone-400 text-xs mt-0.5 truncate max-w-md">${escapeHtml(truncate(item.content || '', 80))}</div>`
                                : `<div class="text-stone-400 text-xs mt-0.5">${escapeHtml(item.location || '')} &middot; ${escapeHtml(item.event_date || '')}</div>`}
                        </td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell">${escapeHtml(item.author_name)}</td>
                        <td class="px-5 py-3.5 text-stone-400 text-xs hidden md:table-cell">${escapeHtml(item.created_at)}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-2">
                                <button data-action="approve" data-type="${item.type}" data-id="${item.id}"
                                    class="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                                    <span class="material-symbols-outlined text-[14px] align-middle mr-1">check</span>Approve
                                </button>
                                <button data-action="reject" data-type="${item.type}" data-id="${item.id}"
                                    class="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                                    <span class="material-symbols-outlined text-[14px] align-middle mr-1">close</span>Reject
                                </button>
                            </div>
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

function emptyState() {
    return `
        <div class="p-8 text-center">
            <span class="material-symbols-outlined text-stone-300 text-[48px]">verified</span>
            <p class="text-stone-400 text-sm mt-2">No pending items to review. Everything is up to date.</p>
        </div>`;
}

function typeBadge(type) {
    const config = {
        announcement: { icon: 'campaign', label: 'Announcement', color: 'bg-sky-50 text-sky-700' },
        event:        { icon: 'event',    label: 'Event',        color: 'bg-amber-50 text-amber-700' },
    };
    const c = config[type] || config.announcement;
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.color}">
        <span class="material-symbols-outlined text-[14px]">${c.icon}</span>${c.label}
    </span>`;
}

// ── Event wiring ───────────────────────────────────────────────────────

function attachEvents(canvas) {
    // Tab filter buttons
    canvas.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            _filter = btn.dataset.filter;
            refresh(canvas);
        });
    });

    // Approve / Reject buttons
    canvas.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.dataset.action !== 'approve' && btn.dataset.action !== 'reject') return;

        const type = btn.dataset.type;
        const id   = parseInt(btn.dataset.id, 10);

        const endpoint = btn.dataset.action === 'approve'
            ? 'approvals/approve.php'
            : 'approvals/reject.php';

        const res = await api.post(endpoint, { type, id });
        if (!res.success) {
            toast.show(res.error || 'Action failed', 'error');
            return;
        }

        const actionLabel = btn.dataset.action === 'approve' ? 'approved' : 'rejected';
        const typeLabel   = type === 'announcement' ? 'Announcement' : 'Event';
        toast.show(`${typeLabel} ${actionLabel}`, 'success');
        await refresh(canvas);
    });
}

// ── Helpers ────────────────────────────────────────────────────────────

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

function renderSkeleton() {
    return `
        <div class="p-6 space-y-4 animate-pulse">
            <div class="flex justify-between items-center">
                <div class="h-8 w-48 bg-stone-200 rounded"></div>
            </div>
            <div class="flex gap-2">
                <div class="h-9 w-32 bg-stone-200 rounded-lg"></div>
                <div class="h-9 w-36 bg-stone-200 rounded-lg"></div>
                <div class="h-9 w-24 bg-stone-200 rounded-lg"></div>
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