// assets/js/views/gallery.js
// CRUD view for Gallery with file upload. Called by router.js.
// DIFFERENT from other views: uses FormData (not JSON) for image upload.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';
import { emptyState } from '../ui/empty-state.js';
import { skeletonRows } from '../ui/skeleton.js';

let _items = [];

export async function loadGallery() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderHeader() + `<table class="w-full text-sm"><tbody>${skeletonRows(5)}</tbody></table>`;
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('gallery/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load gallery: ${res.error || 'Unknown error'}</p>
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
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Gallery</h2>
                <button id="btn-add-gallery"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Upload Image
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">`;
}

function renderFooter() {
    return `</div></div>`;
}

function renderPage(items) {
    if (items.length === 0) {
        return renderHeader() + emptyState('photo_library', 'No gallery images yet', 'Upload an image to get started.') + renderFooter();
    }
    return renderHeader() + renderGrid(items) + renderFooter();
}

// Gallery uses a grid layout (not table) since images are the main content
function renderGrid(items) {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            ${items.map(g => `
                <div data-id="${g.id}" class="group relative rounded-lg overflow-hidden border border-stone-200 hover:shadow-md transition-shadow">
                    <div class="aspect-video bg-stone-100 overflow-hidden relative">
                        <img src="${escapeHtml(g.image_url)}" alt="${escapeHtml(g.title || '')}"
                            class="w-full h-full object-cover"
                            loading="lazy"
                            onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <div class="hidden w-full h-full items-center justify-center bg-stone-100 text-stone-400">
                            <span class="material-symbols-outlined text-[40px]">broken_image</span>
                        </div>
                    </div>
                    <div class="p-3">
                        <div class="font-medium text-stone-800 text-sm">${escapeHtml(g.title || 'Untitled')}</div>
                        ${g.description ? `<div class="text-stone-400 text-xs mt-1 truncate">${escapeHtml(truncate(g.description, 60))}</div>` : ''}
                        <div class="text-stone-400 text-xs mt-1">by ${escapeHtml(g.uploaded_by_name)}</div>
                    </div>
                    <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button data-action="edit" data-id="${g.id}"
                            class="p-1.5 bg-white/90 rounded-md text-stone-500 hover:text-emerald-600 hover:bg-white shadow-sm"
                            title="Edit">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button data-action="delete" data-id="${g.id}"
                            class="p-1.5 bg-white/90 rounded-md text-stone-500 hover:text-red-600 hover:bg-white shadow-sm"
                            title="Delete">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

// ── Event wiring ───────────────────────────────────────────────────────

function attachEvents(canvas) {
    canvas.querySelector('#btn-add-gallery')?.addEventListener('click', openAddModal);

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
    // Gallery upload uses a custom modal with file input (not modal.openForm)
    // because modal.openForm doesn't support file inputs.
    const html = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Title <span class="text-red-500">*</span></label>
                <input type="text" id="gallery-title" required placeholder="e.g. Department Seminar 2026"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea id="gallery-desc" rows="2" placeholder="Brief description of the image"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Image <span class="text-red-500">*</span></label>
                <input type="file" id="gallery-file" accept="image/jpeg,image/png,image/gif,image/webp" required
                    class="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                <p class="text-xs text-stone-400 mt-1">JPG, PNG, GIF, or WebP. Max 5 MB.</p>
                <div id="gallery-preview" class="mt-2 hidden">
                    <img id="gallery-preview-img" class="w-full max-h-48 object-contain rounded-lg border border-stone-200" alt="Preview">
                </div>
            </div>
            <p id="gallery-upload-error" class="text-red-600 text-sm hidden"></p>
        </div>`;

    modal.open({
        title: 'Upload Gallery Image',
        body: html,
        confirmLabel: 'Upload',
        onConfirm: async () => {
            const errEl = document.getElementById('gallery-upload-error');
            if (errEl) errEl.classList.add('hidden');

            const title = document.getElementById('gallery-title').value.trim();
            const desc  = document.getElementById('gallery-desc').value.trim();
            const file  = document.getElementById('gallery-file').files[0];

            if (!title) throw new Error('Title is required');
            if (!file)  throw new Error('Please select an image file');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', desc);
            formData.append('image', file);

            let data;
            try {
                const res = await fetch('api/gallery/store.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData,
                });
                data = await res.json();
            } catch (err) {
                throw new Error('Network error — check your connection');
            }

            if (!data.success) throw new Error(data.error || 'Upload failed');

            toast.show('Gallery image uploaded', 'success');
            await refresh();
            modal.close();
        },
    });

    // Wire up live image preview when a file is selected
    setTimeout(() => {
        const fileInput = document.getElementById('gallery-file');
        if (!fileInput) return;
        fileInput.addEventListener('change', () => {
            const preview = document.getElementById('gallery-preview');
            const previewImg = document.getElementById('gallery-preview-img');
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
                <label class="block text-sm font-medium text-stone-700 mb-1">Title <span class="text-red-500">*</span></label>
                <input type="text" id="gallery-title" value="${escapeHtml(item.title || '')}" required
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea id="gallery-desc" rows="2"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">${escapeHtml(item.description || '')}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Current Image</label>
                <div class="w-full max-h-48 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                    <img src="${escapeHtml(item.image_url)}" alt="Current" class="w-full object-contain"
                        onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-24 text-stone-400\\''><span class=\\'material-symbols-outlined text-3xl\\'>broken_image</span></div>'">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Replace Image</label>
                <input type="file" id="gallery-file" accept="image/jpeg,image/png,image/gif,image/webp"
                    class="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                <p class="text-xs text-stone-400 mt-1">Leave empty to keep current image.</p>
                <div id="gallery-preview" class="mt-2 hidden">
                    <img id="gallery-preview-img" class="w-full max-h-48 object-contain rounded-lg border border-stone-200" alt="Preview">
                </div>
            </div>
            <p id="gallery-upload-error" class="text-red-600 text-sm hidden"></p>
        </div>`;

    modal.open({
        title: 'Edit Gallery Image',
        body: html,
        confirmLabel: 'Save Changes',
        onConfirm: async () => {
            const errEl = document.getElementById('gallery-upload-error');
            if (errEl) errEl.classList.add('hidden');

            const title = document.getElementById('gallery-title').value.trim();
            const desc  = document.getElementById('gallery-desc').value.trim();
            const file  = document.getElementById('gallery-file').files[0];

            if (!title) throw new Error('Title is required');

            const formData = new FormData();
            formData.append('id', item.id);
            formData.append('title', title);
            formData.append('description', desc);
            if (file) formData.append('image', file);

            let data;
            try {
                const res = await fetch('api/gallery/update.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData,
                });
                data = await res.json();
            } catch (err) {
                throw new Error('Network error — check your connection');
            }

            if (!data.success) throw new Error(data.error || 'Update failed');

            toast.show('Gallery image updated', 'success');
            await refresh();
            modal.close();
        },
    });

    // Wire up live image preview when a new file is selected
    setTimeout(() => {
        const fileInput = document.getElementById('gallery-file');
        if (!fileInput) return;
        fileInput.addEventListener('change', () => {
            const preview = document.getElementById('gallery-preview');
            const previewImg = document.getElementById('gallery-preview-img');
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
        title:        'Delete Gallery Image',
        body:         `Are you sure you want to delete "${escapeHtml(item.title || 'Untitled')}"? The image file will also be removed.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('gallery/destroy.php', { id: item.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete gallery image', 'error');
                return;
            }
            toast.show('Gallery image deleted', 'success');
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

function truncate(s, n) {
    const str = String(s ?? '');
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function renderSkeleton() {
    return `
        <div class="p-6 space-y-4 animate-pulse">
            <div class="flex justify-between items-center">
                <div class="h-8 w-40 bg-stone-200 rounded"></div>
                <div class="h-9 w-44 bg-stone-200 rounded-lg"></div>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    ${Array(4).fill('<div class="aspect-video bg-stone-100 rounded-lg"></div>').join('')}
                </div>
            </div>
        </div>`;
}

/**
 * Filter gallery cards by search term.
 * @param {string} term — lowercase search term
 */
export function filterRows(term) {
    const rows = document.querySelectorAll('#main-content [data-id]');
    if (!term) {
        rows.forEach(r => r.style.display = '');
        return;
    }
    rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}