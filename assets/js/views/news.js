// assets/js/views/news.js
// CRUD view for News articles. Mirrors announcements.js so patterns stay consistent.
// Key difference: status enum is published/draft/archived (NOT pending/approved/rejected).
// Called by router.js when navigating to #/news.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';

let _items = []; // local cache, refreshed from API on load and after every mutation

export async function loadNews() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderSkeleton();
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('news/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load news: ${escapeHtml(res.error || 'Unknown error')}</p>
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
                <h2 class="text-2xl font-serif font-semibold text-stone-900">News</h2>
                <button id="btn-add-news"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add Article
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
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Article</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Status</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Author</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Date</th>
                    <th class="px-5 py-3 w-24"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((n, i) => `
                    <tr class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === items.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5">
                            <div class="flex items-start gap-3">
                                ${n.image_url ? `
                                    <img src="${escapeHtml(n.image_url)}" alt=""
                                        class="w-10 h-10 rounded object-cover flex-shrink-0 bg-stone-100"
                                        onerror="this.style.display='none'">` : ''}
                                <div>
                                    <div class="font-medium text-stone-800">${escapeHtml(n.title)}</div>
                                    <div class="text-stone-400 text-xs mt-0.5 truncate max-w-md">${escapeHtml(truncate(n.content, 80))}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-5 py-3.5">${statusBadge(n.status)}</td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell">${escapeHtml(n.author_name)}</td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell text-xs">${formatDate(n.created_at)}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button data-action="edit" data-id="${n.id}"
                                    class="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                                    title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button data-action="delete" data-id="${n.id}"
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
            <span class="material-symbols-outlined text-stone-300 text-[48px]">newspaper</span>
            <p class="text-stone-400 text-sm mt-2">No news articles yet. Add one to get started.</p>
        </div>`;
}

function statusBadge(status) {
    // News status colors: published=emerald, draft=amber, archived=stone
    // DIFFERENT from announcements (pending/approved/rejected)
    const colors = {
        published: 'bg-emerald-50 text-emerald-700',
        draft:     'bg-amber-50 text-amber-700',
        archived:  'bg-stone-100 text-stone-500',
    };
    return `<span class="px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.draft}">${escapeHtml(status)}</span>`;
}

// ── Event wiring ───────────────────────────────────────────────────────

function attachEvents(canvas) {
    canvas.querySelector('#btn-add-news')?.addEventListener('click', openAddModal);

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
    // Add modal does NOT have a status field — server always creates as 'draft'
    modal.openForm({
        title: 'Add News Article',
        fields: [
            { name: 'title',     label: 'Title',     type: 'text',     required: true,  placeholder: 'e.g. Department Newsletter Issue 1' },
            { name: 'content',   label: 'Content',   type: 'textarea', required: true,  placeholder: 'Article body...' },
            { name: 'image_url', label: 'Image URL', type: 'text',     required: false, placeholder: 'https://example.com/image.jpg (optional)' },
        ],
        submitLabel: 'Save as Draft',
        onSubmit: async (data) => {
            const res = await api.post('news/store.php', data);
            if (!res.success) throw new Error(res.error || 'Failed to add news article');
            modal.close();
            toast.show('Article saved as draft', 'success');
            await refresh();
        },
    });
}

function openEditModal(item) {
    // Edit modal DOES have a status field — admin can publish/archive articles
    modal.openForm({
        title: 'Edit News Article',
        fields: [
            { name: 'title',     label: 'Title',     type: 'text',     required: true,  value: item.title },
            { name: 'content',  label: 'Content',   type: 'textarea', required: true,  value: item.content },
            { name: 'image_url', label: 'Image URL', type: 'text',     required: false, value: item.image_url || '' },
            { name: 'status',   label: 'Status',     type: 'select',   required: true,  options: [
                { value: 'draft',     label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived',  label: 'Archived' },
            ], value: item.status || 'draft' },
        ],
        submitLabel: 'Save Changes',
        onSubmit: async (data) => {
            const res = await api.post('news/update.php', { id: item.id, ...data });
            if (!res.success) throw new Error(res.error || 'Failed to update news article');
            modal.close();
            toast.show('Article updated', 'success');
            await refresh();
        },
    });
}

function openDeleteModal(item) {
    modal.open({
        title:        'Delete Article',
        body:         `Are you sure you want to delete "${escapeHtml(item.title)}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('news/destroy.php', { id: item.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete article', 'error');
                return;
            }
            toast.show('Article deleted', 'success');
            await refresh();
        },
    });
}

// ── Helpers ───────────────────────────────────────────────────────────

// Minimal HTML escape — prevents stored XSS when a title/content contains tags.
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
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderSkeleton() {
    return `
        <div class="p-6 space-y-4 animate-pulse">
            <div class="flex justify-between items-center">
                <div class="h-8 w-28 bg-stone-200 rounded"></div>
                <div class="h-9 w-32 bg-stone-200 rounded-lg"></div>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                ${Array(3).fill('<div class="h-14 bg-stone-100 border-b border-stone-200"></div>').join('')}
            </div>
        </div>`;
}
