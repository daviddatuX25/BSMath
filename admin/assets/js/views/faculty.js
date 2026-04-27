// assets/js/views/faculty.js
// CRUD view for Faculty. Admin only. Called by router.js.
// DIFFERENT from other views: uses FormData (not JSON) for image upload.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';
import { emptyState } from '../ui/empty-state.js';
import { skeletonRows } from '../ui/skeleton.js';

let _items = [];

export async function loadFaculty() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderHeader() + `<table class="w-full text-sm"><tbody>${skeletonRows(5)}</tbody></table>`;
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('faculty/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load faculty: ${res.error || 'Unknown error'}</p>
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
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Faculty</h2>
                <button id="btn-add-faculty"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add Faculty
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">`;
}

function renderFooter() {
    return `</div></div>`;
}

function renderPage(items) {
    if (items.length === 0) {
        return renderHeader() + emptyState('school', 'No faculty members yet', 'Add a faculty member to the directory.') + renderFooter();
    }
    return renderHeader() + renderTable(items) + renderFooter();
}

function renderTable(items) {
    return `
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-stone-50 border-b border-stone-200">
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Name</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Position</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden lg:table-cell">Department</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Status</th>
                    <th class="px-5 py-3 w-24"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((f, i) => `
                    <tr data-id="${f.id}" class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === items.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-3">
                                ${f.image_url
                                    ? `<img src="${escapeHtml(f.image_url)}" class="w-8 h-8 rounded-full object-cover" onerror="this.onerror=null;this.outerHTML='<div class=\\'w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs font-medium\\'>${escapeHtml(f.name.charAt(0))}</div>'">`
                                    : `<div class="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs font-medium">${escapeHtml(f.name.charAt(0))}</div>`}
                                <div>
                                    <div class="font-medium text-stone-800">${escapeHtml(f.name)}</div>
                                    <div class="text-stone-400 text-xs">${escapeHtml(f.email || '')}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-stone-600 hidden md:table-cell">${escapeHtml(f.position || '')}</td>
                        <td class="px-5 py-3.5 text-stone-500 hidden lg:table-cell">${escapeHtml(f.department || '')}</td>
                        <td class="px-5 py-3.5">${statusBadge(f.status)}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button data-action="edit" data-id="${f.id}"
                                    class="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                                    title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button data-action="delete" data-id="${f.id}"
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
        active:   'bg-emerald-50 text-emerald-700',
        inactive: 'bg-stone-100 text-stone-500',
    };
    return `<span class="px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.active}">${status}</span>`;
}

// ── Event wiring ───────────────────────────────────────────────────────

function attachEvents(canvas) {
    canvas.querySelector('#btn-add-faculty')?.addEventListener('click', openAddModal);

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
    const html = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Name <span class="text-red-500">*</span></label>
                <input type="text" id="faculty-name" required placeholder="e.g. Dr. Maria Santos"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input type="email" id="faculty-email" placeholder="e.g. maria@bsmath.test"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Position</label>
                <input type="text" id="faculty-position" placeholder="e.g. Professor"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Department</label>
                <input type="text" id="faculty-department" placeholder="e.g. Mathematics"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Specialization</label>
                <input type="text" id="faculty-specialization" placeholder="e.g. Abstract Algebra"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Photo</label>
                <input type="file" id="faculty-file" accept="image/jpeg,image/png,image/gif,image/webp"
                    class="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                <p class="text-xs text-stone-400 mt-1">JPG, PNG, GIF, or WebP. Max 5 MB.</p>
                <div id="faculty-preview" class="mt-2 hidden">
                    <img id="faculty-preview-img" class="w-20 h-20 object-cover rounded-full border border-stone-200" alt="Preview">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select id="faculty-status"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <p id="faculty-error" class="text-red-600 text-sm hidden"></p>
        </div>`;

    modal.open({
        title: 'Add Faculty Member',
        body: html,
        confirmLabel: 'Add Faculty',
        onConfirm: async () => {
            const errEl = document.getElementById('faculty-error');
            if (errEl) errEl.classList.add('hidden');

            const name           = document.getElementById('faculty-name').value.trim();
            const email          = document.getElementById('faculty-email').value.trim();
            const position      = document.getElementById('faculty-position').value.trim();
            const department    = document.getElementById('faculty-department').value.trim();
            const specialization = document.getElementById('faculty-specialization').value.trim();
            const status        = document.getElementById('faculty-status').value;
            const file          = document.getElementById('faculty-file').files[0];

            if (!name) throw new Error('Name is required');

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('position', position);
            formData.append('department', department);
            formData.append('specialization', specialization);
            formData.append('status', status);
            if (file) formData.append('image', file);

            let data;
            try {
                const res = await fetch('../api/faculty/store.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData,
                });
                data = await res.json();
            } catch (err) {
                throw new Error('Network error — check your connection');
            }

            if (!data.success) throw new Error(data.error || 'Failed to add faculty');

            toast.show('Faculty member added', 'success');
            await refresh();
            modal.close();
        },
    });

    setTimeout(() => {
        const fileInput = document.getElementById('faculty-file');
        if (!fileInput) return;
        fileInput.addEventListener('change', () => {
            const preview = document.getElementById('faculty-preview');
            const previewImg = document.getElementById('faculty-preview-img');
            const file = fileInput.files[0];
            if (!file || !preview || !previewImg) {
                if (preview) preview.classList.add('hidden');
                return;
            }
            previewImg.src = URL.createObjectURL(file);
            previewImg.onload = () => preview.classList.remove('hidden');
            previewImg.onerror = () => preview.classList.add('hidden');
        });
    }, 0);
}

function openEditModal(item) {
    const html = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Name <span class="text-red-500">*</span></label>
                <input type="text" id="faculty-name" value="${escapeHtml(item.name || '')}" required
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input type="email" id="faculty-email" value="${escapeHtml(item.email || '')}"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Position</label>
                <input type="text" id="faculty-position" value="${escapeHtml(item.position || '')}"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Department</label>
                <input type="text" id="faculty-department" value="${escapeHtml(item.department || '')}"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Specialization</label>
                <input type="text" id="faculty-specialization" value="${escapeHtml(item.specialization || '')}"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Current Photo</label>
                <div class="w-20 h-20 overflow-hidden rounded-full border border-stone-200 bg-stone-50">
                    ${item.image_url
                        ? `<img src="${escapeHtml(item.image_url)}" class="w-full h-full object-cover"
                            onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center w-full h-full bg-stone-200 text-stone-400 text-xs font-medium\\'>${escapeHtml(item.name.charAt(0))}</div>'">`
                        : `<div class="flex items-center justify-center w-full h-full bg-stone-200 text-stone-400 text-xs font-medium">${escapeHtml(item.name.charAt(0))}</div>`}
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Replace Photo</label>
                <input type="file" id="faculty-file" accept="image/jpeg,image/png,image/gif,image/webp"
                    class="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                <p class="text-xs text-stone-400 mt-1">Leave empty to keep current photo.</p>
                <div id="faculty-preview" class="mt-2 hidden">
                    <img id="faculty-preview-img" class="w-20 h-20 object-cover rounded-full border border-stone-200" alt="Preview">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select id="faculty-status"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <p id="faculty-error" class="text-red-600 text-sm hidden"></p>
        </div>`;

    modal.open({
        title: 'Edit Faculty Member',
        body: html,
        confirmLabel: 'Save Changes',
        onConfirm: async () => {
            const errEl = document.getElementById('faculty-error');
            if (errEl) errEl.classList.add('hidden');

            const name           = document.getElementById('faculty-name').value.trim();
            const email          = document.getElementById('faculty-email').value.trim();
            const position      = document.getElementById('faculty-position').value.trim();
            const department    = document.getElementById('faculty-department').value.trim();
            const specialization = document.getElementById('faculty-specialization').value.trim();
            const status        = document.getElementById('faculty-status').value;
            const file          = document.getElementById('faculty-file').files[0];

            if (!name) throw new Error('Name is required');

            const formData = new FormData();
            formData.append('id', item.id);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('position', position);
            formData.append('department', department);
            formData.append('specialization', specialization);
            formData.append('status', status);
            if (file) formData.append('image', file);

            let data;
            try {
                const res = await fetch('../api/faculty/update.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData,
                });
                data = await res.json();
            } catch (err) {
                throw new Error('Network error — check your connection');
            }

            if (!data.success) throw new Error(data.error || 'Failed to update faculty');

            toast.show('Faculty member updated', 'success');
            await refresh();
            modal.close();
        },
    });

    setTimeout(() => {
        const fileInput = document.getElementById('faculty-file');
        if (!fileInput) return;
        fileInput.addEventListener('change', () => {
            const preview = document.getElementById('faculty-preview');
            const previewImg = document.getElementById('faculty-preview-img');
            const file = fileInput.files[0];
            if (!file || !preview || !previewImg) {
                if (preview) preview.classList.add('hidden');
                return;
            }
            previewImg.src = URL.createObjectURL(file);
            previewImg.onload = () => preview.classList.remove('hidden');
            previewImg.onerror = () => preview.classList.add('hidden');
        });
    }, 0);
}

function openDeleteModal(item) {
    modal.open({
        title:        'Delete Faculty Member',
        body:         `Are you sure you want to delete "${escapeHtml(item.name)}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('faculty/destroy.php', { id: item.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete faculty', 'error');
                return;
            }
            toast.show('Faculty member deleted', 'success');
            await refresh();
        },
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

function renderSkeleton() {
    return `
        <div class="p-6 space-y-4 animate-pulse">
            <div class="flex justify-between items-center">
                <div class="h-8 w-40 bg-stone-200 rounded"></div>
                <div class="h-9 w-44 bg-stone-200 rounded-lg"></div>
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
