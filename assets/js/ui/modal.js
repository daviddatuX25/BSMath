// assets/js/ui/modal.js
// Usage: import { modal } from '../ui/modal.js';
//
// modal.open({
//   title: 'Delete Program',
//   body: 'Are you sure you want to delete this program?',
//   confirmLabel: 'Delete',       // optional, default 'Confirm'
//   confirmClass: 'bg-red-600',   // optional, default 'bg-emerald-600'
//   onConfirm: async () => { ... },
// });
//
// modal.openForm({
//   title: 'Add Program',
//   fields: [
//     { name: 'title', label: 'Title', type: 'text', required: true },
//     { name: 'description', label: 'Description', type: 'textarea' },
//   ],
//   onSubmit: async (data) => { ... },
// });

let _overlay = null;

export const modal = {
    open({ title, body, confirmLabel = 'Confirm', confirmClass = 'bg-emerald-600', onConfirm }) {
        modal.close(); // close any existing modal

        _overlay = document.createElement('div');
        _overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4';

        _overlay.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 class="font-serif text-lg font-semibold text-stone-900 mb-2">${title}</h3>
                <p class="text-stone-600 text-sm mb-6">${body}</p>
                <div class="flex justify-end gap-3">
                    <button id="modal-cancel"
                        class="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button id="modal-confirm"
                        class="px-4 py-2 text-sm font-medium text-white ${confirmClass} hover:opacity-90 rounded-lg transition-opacity">
                        ${confirmLabel}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(_overlay);

        _overlay.querySelector('#modal-cancel').addEventListener('click', modal.close);
        _overlay.querySelector('#modal-confirm').addEventListener('click', async () => {
            if (onConfirm) await onConfirm();
            modal.close();
        });

        // Close on overlay click
        _overlay.addEventListener('click', (e) => {
            if (e.target === _overlay) modal.close();
        });
    },

    openForm({ title, fields = [], submitLabel = 'Save', onSubmit }) {
        modal.close();

        _overlay = document.createElement('div');
        _overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4';

        const fieldsHtml = fields.map(f => {
            if (f.type === 'textarea') {
                return `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-stone-700 mb-1">${f.label}</label>
                        <textarea name="${f.name}" rows="3" ${f.required ? 'required' : ''}
                            class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>
                    </div>`;
            }
            return `
                <div class="mb-4">
                    <label class="block text-sm font-medium text-stone-700 mb-1">${f.label}</label>
                    <input type="${f.type || 'text'}" name="${f.name}" ${f.required ? 'required' : ''}
                        value="${f.value || ''}"
                        class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="${f.placeholder || ''}" />
                </div>`;
        }).join('');

        _overlay.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 class="font-serif text-lg font-semibold text-stone-900 mb-4">${title}</h3>
                <p id="modal-error" class="text-red-600 text-sm mb-2 min-h-[1rem]"></p>
                <form id="modal-form" novalidate>
                    ${fieldsHtml}
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" id="modal-cancel"
                            class="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                            ${submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(_overlay);

        _overlay.querySelector('#modal-cancel').addEventListener('click', modal.close);
        _overlay.addEventListener('click', (e) => {
            if (e.target === _overlay) modal.close();
        });

        _overlay.querySelector('#modal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const errEl = _overlay.querySelector('#modal-error');
            if (errEl) errEl.textContent = '';
            try {
                await onSubmit(data);
            } catch (err) {
                if (errEl) errEl.textContent = err.message || 'An error occurred';
            }
        });
    },

    close() {
        if (_overlay) {
            _overlay.remove();
            _overlay = null;
        }
    }
};
