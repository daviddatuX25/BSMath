/**
 * views/dashboard.js — Premium role-adaptive dashboard
 *
 * Renders a full-bleed dashboard with:
 *   - Role-aware header greeting
 *   - Stats cards (filtered per role)
 *   - Recent Activities timeline feed
 *   - Quick Actions panel (filtered per role)
 *   - System Status widget (admin only)
 *
 * Data comes from:
 *   api/dashboard/stats.php        → { programs, announcements, events, users, pending_approvals, gallery }
 *   api/dashboard/activities.php   → [{ description, user_name, type, created_at }]
 */

import { api }   from '../api.js';
import { toast } from '../ui/toast.js';

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

export async function loadDashboard(user) {
    const canvas = document.getElementById('main-content');
    canvas.innerHTML = renderSkeleton();

    const [statsRes, activitiesRes] = await Promise.all([
        api.get('dashboard/stats.php'),
        api.get('dashboard/activities.php'),
    ]);

    if (!statsRes.success) {
        toast.show('Failed to load dashboard stats', 'error');
        canvas.innerHTML = renderError();
        return;
    }

    const stats      = statsRes.data ?? {};
    const activities = activitiesRes.success ? (activitiesRes.data ?? []) : [];

    canvas.innerHTML = renderDashboard(user, stats, activities);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────────────────────────────────────

function renderDashboard(user, stats, activities) {
    const role  = user?.role ?? 'guest';
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return `
    <div class="p-8 max-w-7xl mx-auto space-y-8">

        <!-- ── Page Header ─────────────────────────────────────────────── -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="space-y-1">
                <span class="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                    Overview &middot; ${formatRoleLabel(role)}
                </span>
                <h2 class="text-5xl font-headline font-bold text-on-surface tracking-tight leading-tight">
                    ${renderGreeting(role, user?.name)}
                </h2>
                <p class="text-stone-500 max-w-lg font-light text-lg mt-2">
                    ${renderSubtitle(role)}
                </p>
            </div>
            <div class="flex items-center gap-3 text-sm font-medium text-stone-500 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100 shrink-0">
                <span class="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
                <span>${today}</span>
            </div>
        </div>

        <!-- ── Stats Cards ──────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-${roleCardCount(role)} gap-5">
            ${renderStatsCards(role, stats)}
        </div>

        <!-- ── Content Grid ─────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Recent Activities (2/3) -->
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col">
                <div class="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 class="text-xl font-headline font-bold text-on-surface">Recent Activities</h3>
                    <button class="text-sm font-bold text-primary hover:underline transition-colors">View All</button>
                </div>
                <div class="p-6 flex-1">
                    ${renderActivities(activities)}
                </div>
            </div>

            <!-- Right Panel (1/3) -->
            <div class="space-y-5">
                ${renderQuickActions(role)}
                ${role === 'admin' ? renderSystemStatus() : renderRoleSummary(role)}
            </div>

        </div>
    </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Role-adaptive header text
// ─────────────────────────────────────────────────────────────────────────────

function renderGreeting(role, name) {
    const greetings = {
        admin:        'Welcome, Admin Panel',
        dean:         `Welcome, ${name ?? 'Dean'}`,
        program_head: `Welcome, ${name ?? 'Program Head'}`,
    };
    return greetings[role] ?? 'Welcome';
}

function renderSubtitle(role) {
    const subtitles = {
        admin:        'Full administrative control over all BS Mathematics department operations.',
        dean:         'Overview of announcements, events, and pending content approvals.',
        program_head: 'Overview of your programs, gallery, and department announcements.',
    };
    return subtitles[role] ?? 'BS Mathematics Admin Portal';
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats cards — filtered per role
// ─────────────────────────────────────────────────────────────────────────────

function roleCardCount(role) {
    if (role === 'admin') return 4;
    return 3;
}

function renderStatsCards(role, stats) {
    const cards = [];

    // Programs — admin + program_head
    if (['admin', 'program_head'].includes(role)) {
        cards.push(renderStatCard({
            label:   'Total Programs',
            value:   stats.programs ?? 0,
            icon:    'account_tree',
            href:    '#/programs',
            primary: true,
            badge:   '+2%',
            badgeIcon: 'trending_up',
        }));
    }

    // Announcements — all roles
    cards.push(renderStatCard({
        label:     'Total Announcements',
        value:     stats.announcements ?? 0,
        icon:      'campaign',
        href:      '#/announcements',
        color:     'emerald',
        badge:     '+14%',
        badgeIcon: 'trending_up',
    }));

    // Events — admin + dean
    if (['admin', 'dean'].includes(role)) {
        cards.push(renderStatCard({
            label:     'Total Events',
            value:     stats.events ?? 0,
            icon:      'event',
            href:      '#/events',
            color:     'amber',
            badge:     `${stats.upcoming_events ?? 0} Upcoming`,
            badgeIcon: 'schedule',
        }));
    }

    // Pending Approvals — dean only
    if (role === 'dean') {
        cards.push(renderStatCard({
            label:   'Pending Approvals',
            value:   stats.pending_approvals ?? 0,
            icon:    'fact_check',
            href:    '#/approvals',
            dark:    true,
            badge:   'Action Needed',
            badgeIcon: 'warning',
        }));
    }

    // Gallery Uploads — program_head
    if (role === 'program_head') {
        cards.push(renderStatCard({
            label:     'Gallery Uploads',
            value:     stats.gallery ?? 0,
            icon:      'gallery_thumbnail',
            href:      '#/gallery',
            color:     'purple',
            badge:     '+3%',
            badgeIcon: 'trending_up',
        }));
    }

    // Total Users — admin only
    if (role === 'admin') {
        cards.push(renderStatCard({
            label:     'Total Users',
            value:     stats.users ?? 0,
            icon:      'group',
            href:      '#/users',
            color:     'blue',
            badge:     '+5%',
            badgeIcon: 'trending_up',
        }));
    }

    return cards.join('');
}

function renderStatCard({ label, value, icon, href, primary, dark, color = 'emerald', badge, badgeIcon }) {
    if (primary) {
        // Green gradient card (hero card)
        return `
        <a href="${href}" class="block bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden group transition-transform hover:-translate-y-1 cursor-pointer no-underline">
            <div class="relative z-10 flex flex-col h-full justify-between">
                <div class="flex justify-between items-start">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <span class="material-symbols-outlined text-white">${icon}</span>
                    </div>
                    ${badge ? `<span class="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-full text-white">
                        <span class="material-symbols-outlined text-[14px]">${badgeIcon}</span> ${badge}
                    </span>` : ''}
                </div>
                <div class="mt-6">
                    <p class="text-green-200 font-medium text-sm mb-1 uppercase tracking-wider">${label}</p>
                    <h3 class="text-4xl font-headline font-bold text-white">${value.toLocaleString()}</h3>
                </div>
            </div>
            <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </a>`;
    }

    if (dark) {
        // Dark card for Pending Approvals
        return `
        <a href="${href}" class="block bg-gradient-to-br from-stone-900 to-stone-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group transition-transform hover:-translate-y-1 cursor-pointer no-underline">
            <div class="relative z-10 flex flex-col h-full justify-between">
                <div class="flex justify-between items-start">
                    <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                        <span class="material-symbols-outlined text-emerald-400">${icon}</span>
                    </div>
                    ${badge ? `<span class="flex items-center gap-1 text-xs font-bold bg-white/10 px-2 py-1 rounded-full text-emerald-400">
                        <span class="material-symbols-outlined text-[14px]">${badgeIcon}</span> ${badge}
                    </span>` : ''}
                </div>
                <div class="mt-6">
                    <p class="text-stone-400 font-medium text-sm mb-1 uppercase tracking-wider">${label}</p>
                    <h3 class="text-4xl font-headline font-bold text-white">${value.toLocaleString()}</h3>
                </div>
            </div>
        </a>`;
    }

    // Standard white card
    const colorMap = {
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-primary', badge: 'bg-emerald-50 text-primary' },
        amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600', badge: 'bg-amber-50 text-amber-600' },
        blue:    { bg: 'bg-blue-50',     border: 'border-blue-100',    text: 'text-blue-600',  badge: 'bg-blue-50 text-blue-600' },
        purple:  { bg: 'bg-purple-50',   border: 'border-purple-100',  text: 'text-purple-600', badge: 'bg-purple-50 text-purple-600' },
    };
    const c = colorMap[color] ?? colorMap.emerald;

    return `
    <a href="${href}" class="block bg-white border border-stone-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group transition-transform hover:-translate-y-1 cursor-pointer no-underline">
        <div class="relative z-10 flex flex-col h-full justify-between">
            <div class="flex justify-between items-start">
                <div class="w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center border ${c.border} ${c.text}">
                    <span class="material-symbols-outlined">${icon}</span>
                </div>
                ${badge ? `<span class="flex items-center gap-1 text-xs font-bold ${c.badge} px-2 py-1 rounded-full">
                    <span class="material-symbols-outlined text-[14px]">${badgeIcon}</span> ${badge}
                </span>` : ''}
            </div>
            <div class="mt-6">
                <p class="text-stone-500 font-medium text-sm mb-1 uppercase tracking-wider">${label}</p>
                <h3 class="text-4xl font-headline font-bold text-on-surface">${value.toLocaleString()}</h3>
            </div>
        </div>
    </a>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Activities feed
// ─────────────────────────────────────────────────────────────────────────────

function renderActivities(activities) {
    if (!activities.length) {
        return `
        <div class="flex flex-col items-center justify-center py-12 text-stone-400">
            <span class="material-symbols-outlined text-[48px] mb-3">history</span>
            <p class="text-sm font-medium">No recent activities.</p>
        </div>`;
    }

    const iconMap = {
        announcement:  { icon: 'campaign',     bg: 'bg-emerald-100', text: 'text-primary' },
        program:       { icon: 'account_tree', bg: 'bg-blue-100',    text: 'text-blue-600' },
        event:         { icon: 'event',        bg: 'bg-amber-100',   text: 'text-amber-600' },
        gallery:       { icon: 'collections',  bg: 'bg-purple-100',  text: 'text-purple-600' },
        user:          { icon: 'person_add',   bg: 'bg-rose-100',    text: 'text-rose-600' },
        approval:      { icon: 'fact_check',   bg: 'bg-stone-100',   text: 'text-stone-600' },
        news:          { icon: 'newspaper',    bg: 'bg-teal-100',    text: 'text-teal-600' },
    };

    const items = activities.slice(0, 8).map(a => {
        const t = iconMap[a.type] ?? { icon: 'history', bg: 'bg-stone-100', text: 'text-stone-500' };
        return `
        <div class="relative">
            <div class="absolute -left-[35px] top-0 w-8 h-8 ${t.bg} rounded-full border-4 border-white flex items-center justify-center ${t.text} shadow-sm">
                <span class="material-symbols-outlined text-[16px]">${t.icon}</span>
            </div>
            <div>
                <p class="text-sm font-bold text-on-surface">${escHtml(a.description)}</p>
                <p class="text-xs text-stone-400 font-medium mt-1.5">${escHtml(a.user_name ?? '')} &middot; ${formatDate(a.created_at)}</p>
            </div>
        </div>`;
    }).join('');

    return `<div class="relative pl-6 border-l-2 border-stone-100 space-y-7">${items}</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Actions panel — filtered per role
// ─────────────────────────────────────────────────────────────────────────────

function renderQuickActions(role) {
    const all = [
        { label: 'Add Program',         icon: 'add_circle',    color: 'text-primary bg-emerald-50',   href: '#/programs',       roles: ['admin', 'program_head'] },
        { label: 'Create Announcement', icon: 'campaign',      color: 'text-blue-600 bg-blue-50',      href: '#/announcements',  roles: ['admin', 'dean', 'program_head'] },
        { label: 'Upload Gallery',      icon: 'collections',   color: 'text-purple-600 bg-purple-50',  href: '#/gallery',        roles: ['admin', 'program_head'] },
        { label: 'Schedule Event',      icon: 'event',         color: 'text-amber-600 bg-amber-50',    href: '#/events',         roles: ['admin', 'dean'] },
        { label: 'Approve Content',     icon: 'fact_check',    color: 'text-primary bg-emerald-50',    href: '#/approvals',      roles: ['dean'] },
        { label: 'Manage Users',        icon: 'group',         color: 'text-rose-600 bg-rose-50',      href: '#/users',          roles: ['admin'] },
        { label: 'Manage News',         icon: 'newspaper',     color: 'text-teal-600 bg-teal-50',      href: '#/news',           roles: ['admin'] },
        { label: 'Manage Faculty',      icon: 'school',        color: 'text-indigo-600 bg-indigo-50',  href: '#/faculty',        roles: ['admin'] },
    ];

    const filtered = all.filter(a => a.roles.includes(role));
    if (!filtered.length) return '';

    const buttons = filtered.map(a => `
        <a href="${a.href}" class="flex flex-col items-center justify-center gap-2.5 p-4 bg-surface rounded-xl hover:bg-stone-100 hover:shadow-sm border border-transparent hover:border-stone-200 transition-all text-stone-700 group no-underline">
            <div class="w-10 h-10 ${a.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined">${a.icon}</span>
            </div>
            <span class="text-xs font-bold text-center leading-tight">${a.label.replace(' ', '<br/>')}</span>
        </a>`).join('');

    return `
    <div class="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
        <h3 class="text-xl font-headline font-bold text-on-surface mb-5">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-3">${buttons}</div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// System Status widget (admin only)
// ─────────────────────────────────────────────────────────────────────────────

function renderSystemStatus() {
    return `
    <div class="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div class="relative z-10">
            <div class="flex items-center gap-2 mb-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">System Status</span>
            </div>
            <h4 class="text-lg font-headline font-bold">All services running</h4>
            <p class="text-sm text-stone-400 mt-1">Next scheduled maintenance in 14 days.</p>
            <div class="mt-5 pt-5 border-t border-stone-700/50 space-y-3">
                <div class="flex justify-between items-center">
                    <p class="text-xs text-stone-400">Database Storage</p>
                    <p class="text-xs font-bold text-white">42%</p>
                </div>
                <div class="w-full bg-stone-700 rounded-full h-1.5">
                    <div class="bg-emerald-400 h-1.5 rounded-full" style="width: 42%"></div>
                </div>
            </div>
        </div>
        <span class="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-white/5 rotate-12 pointer-events-none">storage</span>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Role summary widget (dean / program_head)
// ─────────────────────────────────────────────────────────────────────────────

function renderRoleSummary(role) {
    const config = {
        dean: {
            icon:    'verified',
            title:   'Content Approval',
            body:    'You are responsible for reviewing and approving announcements and events before they go live.',
            color:   'bg-emerald-50 border-emerald-100',
            iconColor: 'text-primary',
        },
        program_head: {
            icon:    'account_tree',
            title:   'Program Management',
            body:    'You manage BS Mathematics programs, the gallery, and department announcements.',
            color:   'bg-blue-50 border-blue-100',
            iconColor: 'text-blue-600',
        },
    };
    const c = config[role] ?? config.program_head;

    return `
    <div class="${c.color} rounded-2xl border p-6 relative overflow-hidden">
        <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <span class="material-symbols-outlined ${c.iconColor}">${c.icon}</span>
            </div>
            <div>
                <h4 class="font-headline font-bold text-on-surface">${c.title}</h4>
                <p class="text-sm text-stone-500 mt-1 leading-relaxed">${c.body}</p>
            </div>
        </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────

function renderSkeleton() {
    return `
    <div class="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div class="space-y-3">
            <div class="h-3 w-32 bg-stone-200 rounded-full"></div>
            <div class="h-12 w-80 bg-stone-200 rounded-xl"></div>
            <div class="h-4 w-64 bg-stone-200 rounded-full"></div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
            ${Array(4).fill('<div class="bg-stone-200 rounded-2xl h-36"></div>').join('')}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-stone-200 rounded-2xl h-96"></div>
            <div class="space-y-5">
                <div class="bg-stone-200 rounded-2xl h-64"></div>
                <div class="bg-stone-200 rounded-2xl h-40"></div>
            </div>
        </div>
    </div>`;
}

function renderError() {
    return `
    <div class="p-8 flex flex-col items-center justify-center text-stone-400 min-h-64">
        <span class="material-symbols-outlined text-[48px] mb-3 text-secondary">error</span>
        <p class="font-medium text-on-surface">Could not load dashboard data.</p>
        <p class="text-sm mt-1">Please refresh the page or contact your administrator.</p>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatRoleLabel(role) {
    return { admin: 'Admin', dean: 'Dean', program_head: 'Program Head' }[role] ?? role;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60_000)  return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
