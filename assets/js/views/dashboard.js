// assets/js/views/dashboard.js
// Called by router when user navigates to #/dashboard.
// Fetches stats + activities from API and renders them into #main-canvas.

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';

export async function loadDashboard(user) {
    const canvas = document.getElementById('main-canvas');
    canvas.innerHTML = renderSkeleton();

    // Fetch stats and activities in parallel
    const [statsRes, activitiesRes] = await Promise.all([
        api.get('dashboard/stats.php'),
        api.get('dashboard/activities.php'),
    ]);

    if (!statsRes.success) {
        toast.show('Failed to load dashboard stats', 'error');
        return;
    }

    const stats      = statsRes.data;
    // activities API returns description field, not action
    const activities = activitiesRes.success ? activitiesRes.data : [];

    canvas.innerHTML = `
        <div class="p-6 space-y-6">

            <!-- Welcome header -->
            <div>
                <h2 class="text-2xl font-serif font-semibold text-stone-900">
                    Welcome, ${user.name}
                </h2>
                <p class="text-stone-500 text-sm mt-0.5 capitalize">
                    ${user.role.replace('_', ' ')}
                </p>
            </div>

            <!-- Stats cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                ${renderStatCard('Total Programs',      stats.programs,      'school',        '#/programs')}
                ${renderStatCard('Total Announcements', stats.announcements, 'campaign',      '#/announcements')}
                ${renderStatCard('Total Events',        stats.events,        'event',         '#/events')}
                ${renderStatCard('Total Users',         stats.users,         'manage_accounts','#/users')}
            </div>

            <!-- Quick Actions (role-filtered) -->
            ${renderQuickActions(user.role)}

            <!-- Recent Activities -->
            <div class="bg-white rounded-xl shadow-sm p-5">
                <h3 class="font-serif text-base font-semibold text-stone-800 mb-4">Recent Activities</h3>
                ${activities.length === 0
                    ? `<p class="text-stone-400 text-sm">No activities yet.</p>`
                    : `<ul class="space-y-3">
                        ${activities.map(a => `
                            <li class="flex items-start gap-3">
                                <span class="material-symbols-outlined text-emerald-600 text-[18px] mt-0.5">history</span>
                                <div>
                                    <p class="text-sm text-stone-700">${a.description}</p>
                                    <p class="text-xs text-stone-400 mt-0.5">${a.user_name} · ${formatDate(a.created_at)}</p>
                                </div>
                            </li>`
                        ).join('')}
                    </ul>`
                }
            </div>

        </div>
    `;
}

function renderStatCard(label, value, icon, href) {
    return `
        <a href="${href}" class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-emerald-600">${icon}</span>
            </div>
            <div>
                <p class="text-2xl font-semibold text-stone-900">${value}</p>
                <p class="text-xs text-stone-500 mt-0.5">${label}</p>
            </div>
        </a>`;
}

function renderQuickActions(role) {
    const actions = [];
    if (['admin', 'program_head'].includes(role)) {
        actions.push({ label: 'Add Program',          icon: 'school',   href: '#/programs' });
    }
    if (['admin', 'dean', 'program_head'].includes(role)) {
        actions.push({ label: 'Create Announcement',  icon: 'campaign', href: '#/announcements' });
    }
    if (['admin', 'program_head'].includes(role)) {
        actions.push({ label: 'Upload Gallery',       icon: 'photo_library', href: '#/gallery' });
    }
    if (actions.length === 0) return '';
    return `
        <div class="bg-white rounded-xl shadow-sm p-5">
            <h3 class="font-serif text-base font-semibold text-stone-800 mb-4">Quick Actions</h3>
            <div class="flex flex-wrap gap-3">
                ${actions.map(a => `
                    <a href="${a.href}"
                        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-[16px]">${a.icon}</span>
                        ${a.label}
                    </a>`).join('')}
            </div>
        </div>`;
}

function renderSkeleton() {
    return `
        <div class="p-6 space-y-6 animate-pulse">
            <div class="h-8 w-48 bg-stone-200 rounded"></div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                ${Array(4).fill('<div class="bg-stone-200 rounded-xl h-24"></div>').join('')}
            </div>
            <div class="bg-stone-200 rounded-xl h-48"></div>
        </div>`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
