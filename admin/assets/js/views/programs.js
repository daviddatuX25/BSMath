// assets/js/views/programs.js
// CRUD view for the Programs module.
// Called by router when navigating to #/programs.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';
import { emptyState } from '../ui/empty-state.js';
import { skeletonRows } from '../ui/skeleton.js';

let _programs = []; // local cache — refreshed on every load and after mutations

export async function loadPrograms() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderHeader() + `<table class="w-full text-sm"><tbody>${skeletonRows(5)}</tbody></table>`;
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('programs/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load programs: ${res.error || 'Unknown error'}</p>
            </div>`;
        return;
    }

    _programs = res.data;
    canvas.innerHTML = renderPage(_programs);
    attachEvents(canvas);
}

function renderHeader() {
    return `
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Manage Programs</h2>
                <button id="btn-add-program"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add Program
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">`;
}

function renderFooter() {
    return `</div></div>`;
}

function renderPage(programs) {
    if (programs.length === 0) {
        return renderHeader() + emptyState('school', 'No programs yet', 'Create your first program to get started.') + renderFooter();
    }
    return renderHeader() + `
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-stone-50 border-b border-stone-200">
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Title</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Description</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium hidden md:table-cell">Added By</th>
                    <th class="px-5 py-3 w-24"></th>
                </tr>
            </thead>
            <tbody>
                ${programs.map((p, i) => `
                    <tr data-id="${p.id}" class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === programs.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5 font-medium text-stone-800">${p.name}</td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell max-w-xs truncate">
                            ${p.description || '<span class="text-stone-300">—</span>'}
                        </td>
                        <td class="px-5 py-3.5 text-stone-500 hidden md:table-cell">${p.created_by_name}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button data-action="edit" data-id="${p.id}"
                                    class="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                                    title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button data-action="delete" data-id="${p.id}"
                                    class="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                    title="Delete">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>`
                ).join('')}
            </tbody>
        </table>` + renderFooter();
}

function attachEvents(canvas) {
    // Add Program button
    canvas.querySelector('#btn-add-program')?.addEventListener('click', openAddModal);

    // Row action buttons (edit / delete) — event delegation on tbody
    canvas.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = parseInt(btn.dataset.id, 10);
        const program = _programs.find(p => p.id === id);
        if (!program) return;

        if (btn.dataset.action === 'edit')   openEditModal(program);
        if (btn.dataset.action === 'delete') openDeleteModal(program);
    });
}

function openAddModal() {
    modal.openForm({
        title: 'Add Program',
        fields: [
            { name: 'name',        label: 'Title',       type: 'text',     required: true, placeholder: 'e.g. Applied Mathematics Track' },
            { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Brief description (optional)' },
        ],
        submitLabel: 'Add Program',
        onSubmit: async (data) => {
            const res = await api.post('programs/store.php', data);
            if (!res.success) throw new Error(res.error || 'Failed to add program');
            modal.close();
            toast.show('Program added successfully', 'success');
            await refresh();
        },
    });
}

function openEditModal(program) {
    modal.openForm({
        title: 'Edit Program',
        fields: [
            { name: 'name',        label: 'Title',       type: 'text',     required: true,  value: program.name },
            { name: 'description', label: 'Description', type: 'textarea', required: false, value: program.description || '' },
        ],
        submitLabel: 'Save Changes',
        onSubmit: async (data) => {
            const res = await api.post('programs/update.php', { id: program.id, ...data });
            if (!res.success) throw new Error(res.error || 'Failed to update program');
            modal.close();
            toast.show('Program updated', 'success');
            await refresh();
        },
    });
}

function openDeleteModal(program) {
    modal.open({
        title: 'Delete Program',
        body: `Are you sure you want to delete "${program.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('programs/destroy.php', { id: program.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete program', 'error');
                return;
            }
            toast.show('Program deleted', 'success');
            await refresh();
        },
    });
}

function renderSkeleton() {
    return `
        <div class="p-6 space-y-4 animate-pulse">
            <div class="flex justify-between items-center">
                <div class="h-8 w-48 bg-stone-200 rounded"></div>
                <div class="h-9 w-32 bg-stone-200 rounded-lg"></div>
            </div>
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                ${Array(4).fill('<div class="h-14 bg-stone-100 border-b border-stone-200"></div>').join('')}
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