// assets/js/views/announcements.js
// CRUD view for Announcements. Mirrors programs.js so patterns stay consistent.
// Called by router.js when navigating to #/announcements.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';

let _items = []; // local cache, refreshed from API on load and after every mutation

export async function loadAnnouncements() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderSkeleton();
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('announcements/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load announcements: ${res.error || 'Unknown error'}</p>
            </div>`;
        return;
    }

    _items = res.data;
    canvas.innerHTML = renderPage(_items);
    attachEvents(canvas);
}

// ── Rendering ──────────────────────────────────────────────────────────

function renderPage(items) {
    return `
        <div class="p-6 space-y-4">

            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Announcements</h2>
                <button id="btn-add-announcement"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add Announcement
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
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Title</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Priority</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Status</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Author</th>
                    <th class="px-5 py-3 w-24"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((a, i) => `
                    <tr class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === items.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5">
                            <div class="font-medium text-stone-800">${escapeHtml(a.title)}</div>
                            <div class="text-stone-400 text-xs mt-0.5 truncate max-w-md">${escapeHtml(truncate(a.content, 80))}</div>
                        </td>
                        <td class="px-5 py-3.5 hidden md:table-cell">${priorityBadge(a.priority)}</td>
                        <td class="px-5 py-3.5">${statusBadge(a.status)}</td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell">${escapeHtml(a.author_name)}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button data-action="edit" data-id="${a.id}"
                                    class="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                                    title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button data-action="delete" data-id="${a.id}"
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

function emptyState() {
    return `
        <div class="p-8 text-center">
            <span class="material-symbols-outlined text-stone-300 text-[48px]">campaign</span>
            <p class="text-stone-400 text-sm mt-2">No announcements yet. Add one to get started.</p>
        </div>`;
}

function priorityBadge(priority) {
    const colors = {
        low:    'bg-stone-100 text-stone-600',
        normal: 'bg-sky-50 text-sky-700',
        high:   'bg-red-50 text-red-700',
    };
    return `<span class="px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || colors.normal}">${priority}</span>`;
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
    canvas.querySelector('#btn-add-announcement')?.addEventListener('click', openAddModal);

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
        title: 'Add Announcement',
        fields: [
            { name: 'title',    label: 'Title',    type: 'text',     required: true,  placeholder: 'e.g. Midterm schedule released' },
            { name: 'content',  label: 'Content',  type: 'textarea', required: true,  placeholder: 'What do you want to announce?' },
            { name: 'priority', label: 'Priority', type: 'select',   required: false, options: [
                { value: 'low',    label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high',   label: 'High' },
            ], value: 'normal' },
        ],
        submitLabel: 'Add Announcement',
        onSubmit: async (data) => {
            const res = await api.post('announcements/store.php', data);
            if (!res.success) throw new Error(res.error || 'Failed to add announcement');
            modal.close();
            toast.show('Announcement added (pending approval)', 'success');
            await refresh();
        },
    });
}

function openEditModal(item) {
    modal.openForm({
        title: 'Edit Announcement',
        fields: [
            { name: 'title',    label: 'Title',    type: 'text',     required: true,  value: item.title },
            { name: 'content',  label: 'Content',  type: 'textarea', required: true,  value: item.content },
            { name: 'priority', label: 'Priority', type: 'select',   required: false, options: [
                { value: 'low',    label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high',   label: 'High' },
            ], value: item.priority || 'normal' },
        ],
        submitLabel: 'Save Changes',
        onSubmit: async (data) => {
            const res = await api.post('announcements/update.php', { id: item.id, ...data });
            if (!res.success) throw new Error(res.error || 'Failed to update announcement');
            modal.close();
            toast.show('Announcement updated', 'success');
            await refresh();
        },
    });
}

function openDeleteModal(item) {
    modal.open({
        title:        'Delete Announcement',
        body:         `Are you sure you want to delete "${escapeHtml(item.title)}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('announcements/destroy.php', { id: item.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete announcement', 'error');
                return;
            }
            toast.show('Announcement deleted', 'success');
            await refresh();
        },
    });
}

// ── Helpers ────────────────────────────────────────────────────────────

// Minimal HTML escape — prevents stored XSS when a title/content contains tags.
// Same helper will be duplicated in events.js and news.js; Phase 5 can extract
// to a shared util if desired.
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
                <div class="h-8 w-56 bg-stone-200 rounded"></div>
                <div class="h-9 w-44 bg-stone-200 rounded-lg"></div>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                ${Array(3).fill('<div class="h-14 bg-stone-100 border-b border-stone-200"></div>').join('')}
            </div>
        </div>`;
}