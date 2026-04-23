// assets/js/ui/toast.js
// Usage: import { toast } from '../ui/toast.js';
//        toast.show('Saved!', 'success');
//        toast.show('Something went wrong', 'error');

let _container = null;

function getContainer() {
    if (!_container) {
        _container = document.createElement('div');
        _container.id = 'toast-container';
        _container.className = 'fixed bottom-6 right-6 flex flex-col gap-2 z-50';
        document.body.appendChild(_container);
    }
    return _container;
}

export const toast = {
    show(message, type = 'success') {
        const container = getContainer();

        const el = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
        el.className = `${bgColor} text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg
                        flex items-center gap-2 transition-opacity duration-300 opacity-0`;
        el.innerHTML = `
            <span class="material-symbols-outlined text-[16px]">
                ${type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>${message}</span>
        `;

        container.appendChild(el);

        // Fade in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { el.classList.replace('opacity-0', 'opacity-100'); });
        });

        // Auto-dismiss after 3s
        setTimeout(() => {
            el.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }
};
