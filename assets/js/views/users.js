// assets/js/views/users.js
// CRUD view for Users. Admin only. Called by router.js.
// IMPORTANT: Add modal requires password. Edit modal has optional password.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';
import { modal } from '../ui/modal.js';

let _items = [];

export async function loadUsers() {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderSkeleton();
    await refresh(canvas);
}

async function refresh(canvas) {
    canvas = canvas || document.getElementById('main-content');
    const res = await api.get('users/index.php');

    if (!res.success) {
        canvas.innerHTML = `
            <div class="p-6">
                <p class="text-red-600 text-sm">Failed to load users: ${res.error || 'Unknown error'}</p>
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
                <h2 class="text-2xl font-serif font-semibold text-stone-900">Users</h2>
                <button id="btn-add-user"
                    class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add User
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
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Name</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Email</th>
                    <th class="text-left px-5 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">Role</th>
                    <th class="px-5 py-3 w-24"></th>
                </tr>
            </thead>
            <tbody>
                ${items.map((u, i) => `
                    <tr class="group border-b border-stone-100 hover:bg-stone-50 transition-colors
                        ${i === items.length - 1 ? 'border-b-0' : ''}">
                        <td class="px-5 py-3.5">
                            <div class="font-medium text-stone-800">${escapeHtml(u.name)}</div>
                        </td>
                        <td class="px-5 py-3.5 text-stone-500">${escapeHtml(u.email)}</td>
                        <td class="px-5 py-3.5">${roleBadge(u.role)}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button data-action="edit" data-id="${u.id}"
                                    class="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                                    title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button data-action="delete" data-id="${u.id}"
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
            <span class="material-symbols-outlined text-stone-300 text-[48px]">group</span>
            <p class="text-stone-400 text-sm mt-2">No users yet. Add one to get started.</p>
        </div>`;
}

function roleBadge(role) {
    const colors = {
        admin:        'bg-emerald-50 text-emerald-700',
        dean:         'bg-amber-50 text-amber-700',
        program_head: 'bg-sky-50 text-sky-700',
    };
    const labels = {
        admin:        'Administrator',
        dean:         'Dean / Principal',
        program_head: 'Program Head',
    };
    return `<span class="px-2 py-0.5 rounded text-xs font-medium ${colors[role] || colors.admin}">${labels[role] || role}</span>`;
}

// ── Event wiring ───────────────────────────────────────────────────────

function attachEvents(canvas) {
    canvas.querySelector('#btn-add-user')?.addEventListener('click', openAddModal);

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
        title: 'Add User',
        fields: [
            { name: 'name',     label: 'Name',     type: 'text',     required: true,  placeholder: 'e.g. Jane Doe' },
            { name: 'email',    label: 'Email',    type: 'text',     required: true,  placeholder: 'e.g. jane@bsmath.test' },
            { name: 'password', label: 'Password', type: 'text',     required: true,  placeholder: 'Minimum 6 characters' },
            { name: 'role',     label: 'Role',     type: 'select',   required: true,  options: [
                { value: 'admin',        label: 'Administrator' },
                { value: 'dean',         label: 'Dean / Principal' },
                { value: 'program_head', label: 'Program Head' },
            ], value: 'admin' },
        ],
        submitLabel: 'Add User',
        onSubmit: async (data) => {
            const res = await api.post('users/store.php', data);
            if (!res.success) throw new Error(res.error || 'Failed to add user');
            modal.close();
            toast.show('User added', 'success');
            await refresh();
        },
    });
}

function openEditModal(item) {
    // Edit modal: password is optional. Show a note explaining this.
    const html = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Name <span class="text-red-500">*</span></label>
                <input type="text" id="user-name" value="${escapeHtml(item.name)}" required
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input type="email" id="user-email" value="${escapeHtml(item.email)}" required
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                <input type="password" id="user-password" placeholder="Leave blank to keep current password"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <p class="text-xs text-stone-400 mt-1">Leave blank to keep current password.</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">Role <span class="text-red-500">*</span></label>
                <select id="user-role" required
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Administrator</option>
                    <option value="dean" ${item.role === 'dean' ? 'selected' : ''}>Dean / Principal</option>
                    <option value="program_head" ${item.role === 'program_head' ? 'selected' : ''}>Program Head</option>
                </select>
            </div>
        </div>`;

    modal.open({
        title: 'Edit User',
        body: html,
        confirmLabel: 'Save Changes',
        onConfirm: async () => {
            const name     = document.getElementById('user-name').value.trim();
            const email    = document.getElementById('user-email').value.trim();
            const password = document.getElementById('user-password').value;
            const role     = document.getElementById('user-role').value;

            if (!name || !email) throw new Error('Name and email are required');

            const payload = { id: item.id, name, email, role };
            // Only include password if user typed a new one
            if (password) payload.password = password;

            const res = await api.post('users/update.php', payload);
            if (!res.success) throw new Error(res.error || 'Failed to update user');
            modal.close();
            toast.show('User updated', 'success');
            await refresh();
        },
    });
}

function openDeleteModal(item) {
    modal.open({
        title:        'Delete User',
        body:         `Are you sure you want to delete "${escapeHtml(item.name)}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
            const res = await api.post('users/destroy.php', { id: item.id });
            if (!res.success) {
                toast.show(res.error || 'Failed to delete user', 'error');
                return;
            }
            toast.show('User deleted', 'success');
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
                <div class="h-8 w-32 bg-stone-200 rounded"></div>
                <div class="h-9 w-36 bg-stone-200 rounded-lg"></div>
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