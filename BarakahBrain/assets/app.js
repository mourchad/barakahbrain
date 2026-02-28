/**
 * BarakahBrain — App Core (Backend JS — frontend simulation)
 * En production, connecter à un vrai serveur Node.js/Express + base de données.
 */

// ── Toast ─────────────────────────────────────────────────────────────
const Toast = {
    show(msg, type = 'info', duration = 3500) {
        let container = document.getElementById('bb-toast');
        if (!container) {
            container = document.createElement('div');
            container.id = 'bb-toast';
            document.body.appendChild(container);
        }
        const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
        const colors = { success: '#34d399', error: '#f87171', info: '#d4af37', warning: '#fbbf24' };
        const toast = document.createElement('div');
        toast.className = `bb-toast bb-toast--${type}`;
        toast.innerHTML = `
      <span class="material-symbols-outlined" style="color:${colors[type]}">${icons[type]}</span>
      <span>${msg}</span>
      <button onclick="this.parentElement.remove()" style="margin-left:auto;color:var(--bb-text-subtle);font-size:1.2rem;line-height:1;">&times;</button>
    `;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(8px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
    }
};

// ── Modal ─────────────────────────────────────────────────────────────
const Modal = {
    show({ title = '', body = '', confirmLabel = 'Confirmer', cancelLabel = 'Annuler', onConfirm = null, danger = false }) {
        const backdrop = document.createElement('div');
        backdrop.className = 'bb-modal-backdrop';
        backdrop.innerHTML = `
      <div class="bb-modal" role="dialog" aria-modal="true">
        <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:700;margin-bottom:0.75rem">${title}</h3>
        <p style="color:var(--bb-text-muted);font-size:0.9375rem;margin-bottom:1.5rem">${body}</p>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end">
          <button class="bb-btn bb-btn-ghost" id="bb-modal-cancel">${cancelLabel}</button>
          <button class="bb-btn ${danger ? 'bb-btn-danger' : 'bb-btn-gold'}" id="bb-modal-confirm">${confirmLabel}</button>
        </div>
      </div>
    `;
        document.body.appendChild(backdrop);
        backdrop.querySelector('#bb-modal-cancel').onclick = () => backdrop.remove();
        backdrop.querySelector('#bb-modal-confirm').onclick = () => { onConfirm && onConfirm(); backdrop.remove(); };
        backdrop.onclick = e => { if (e.target === backdrop) backdrop.remove(); };
    }
};

// ── Sidebar Toggle (Admin Pages) ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // initMobileNav removed - handled by layouts.js

    const hamburger = document.querySelector('.bb-hamburger:not(#bb-nav-toggle)');
    const sidebar = document.querySelector('.bb-sidebar');
    const overlay = document.querySelector('.bb-sidebar-overlay');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('bb-sidebar--open');
        });
        overlay && overlay.addEventListener('click', () => sidebar.classList.remove('bb-sidebar--open'));
    }

    // Dynamic Admin Link
    checkAdminDashboard();

    // Mobile quiz: warn on refresh / leave
    if (document.querySelector('.bb-quiz-page')) {
        window.addEventListener('beforeunload', e => {
            e.preventDefault(); e.returnValue = '';
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                const warn = document.getElementById('bb-cheat-warning');
                if (warn) { warn.style.backgroundColor = 'rgba(239,68,68,0.2)'; warn.style.borderColor = 'rgba(239,68,68,0.5)'; }
                Toast.show('⚠️ Vous avez quitté la page — votre quiz peut être annulé.', 'error', 5000);
            }
        });
    }

    // Timer logic for quiz page
    const timerEl = document.getElementById('bb-timer');
    if (timerEl) initTimer(timerEl);
});

window.QuizTimer = {
    _interval: null,
    _seconds: 0,
    _el: null,

    init(el, initialSeconds = 900) {
        this._el = el;
        this._seconds = initialSeconds;
        this.stop();
        this._render();
    },

    start() {
        if (this._interval) return;
        this._render();
        this._interval = setInterval(() => {
            if (this._seconds <= 0) {
                this.stop();
                Toast.show('Temps écoulé !', 'warning');
                // Auto-submit logic if in quiz page
                if (typeof finishQuiz === 'function') finishQuiz();
            } else {
                this._seconds--;
                this._render();
            }
        }, 1000);
    },

    stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    },

    reset(seconds) {
        this.stop();
        this._seconds = seconds;
        this.start();
    },

    _render() {
        if (!this._el) return;
        const m = Math.floor(this._seconds / 60);
        const s = this._seconds % 60;
        this._el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        this._el.classList.toggle('bb-timer--warning', this._seconds <= 10 && this._seconds > 5);
        this._el.classList.toggle('bb-timer--danger', this._seconds <= 5);
    }
};

function initTimer(el) {
    window.QuizTimer.init(el, parseInt(el.dataset.seconds || 900, 10));
}

// ── Confirmation Utility ─────────────────────────────────────────────
const Confirm = {
    ask(title, body, onConfirm, danger = false) {
        Modal.show({ title, body, onConfirm, danger });
    }
};

// ── Form Change Detection ────────────────────────────────────────────
const FormGuard = {
    _initialData: null,
    watch(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        this._initialData = new FormData(form);
        window.onbeforeunload = (e) => {
            const currentData = new FormData(form);
            let changed = false;
            for (let [key, value] of this._initialData.entries()) {
                if (currentData.get(key) !== value) { changed = true; break; }
            }
            if (changed) { e.preventDefault(); e.returnValue = ''; }
        };
    }
};

// ── Role Change (Superadmin1 page) ────────────────────────────────────
function changeRole(userId, newRole) {
    Confirm.ask(
        'Changer le rôle',
        `Voulez-vous vraiment attribuer le rôle <strong>${newRole}</strong> à cet utilisateur&nbsp;?`,
        () => {
            // In production: PUT /api/users/:userId/role with { role: newRole }
            const row = document.querySelector(`[data-uid="${userId}"]`) || document.querySelector(`[data-user-id="${userId}"]`);
            if (row) {
                const badge = row.querySelector('.bb-role-badge');
                if (badge) {
                    badge.textContent = newRole;
                    badge.className = `bb-badge bb-role-badge role-${newRole.toLowerCase()}`;
                }
            }
            Toast.show(`Rôle attribué : ${newRole}`, 'success');
        }
    );
}

// ── Share Winners ─────────────────────────────────────────────────────
function shareWinners() {
    Confirm.ask(
        'Partager la liste officielle',
        'La liste des gagnants sera publiée et partagée officiellement. Cette action est irréversible.',
        () => Toast.show('Liste officielle partagée avec succès !', 'success')
    );
}

// ── Confirm Logout ────────────────────────────────────────────────────
function confirmLogout() {
    Confirm.ask(
        'Déconnexion',
        'Voulez-vous vraiment vous déconnecter ?',
        () => { sessionStorage.clear(); window.location.href = (window.location.pathname.includes('/admin/') ? '../' : '') + 'connexion.html'; },
        true
    );
}

// ── Notifications ─────────────────────────────────────────────────────
function updateNotificationBadge(count) {
    const bells = document.querySelectorAll('.material-symbols-outlined');
    bells.forEach(icon => {
        if (icon.textContent === 'notifications_active' || icon.textContent === 'notifications') {
            const btn = icon.parentElement;

            // Fix: Add click redirection
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                const prefix = window.location.pathname.includes('/admin/') ? '../' : '';
                window.location.href = prefix + 'notifications.html';
            };

            let badge = btn.querySelector('.bb-notif-badge');
            if (!badge && count > 0) {
                badge = document.createElement('span');
                badge.className = 'bb-notif-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: var(--bb-danger);
                    color: white;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 5px;
                    border-radius: 10px;
                    border: 2px solid var(--bb-surface);
                    line-height: 1;
                    pointer-events: none;
                `;
                btn.style.position = 'relative';
                btn.appendChild(badge);
            }
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    });
}

// ── Admin Dashboard Link ─────────────────────────────────────────────
function checkAdminDashboard() {
    const token = sessionStorage.getItem('bb_token');
    if (!token) return;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'Admin' || payload.role === 'Superadmin1' || payload.role === 'Superadmin') {
            const headerActions = document.querySelector('.bb-header__actions');
            if (headerActions && !document.getElementById('admin-dash-btn')) {
                const prefix = window.location.pathname.includes('/admin/') ? '' : 'admin/';
                const btn = document.createElement('a');
                btn.id = 'admin-dash-btn';
                btn.href = prefix + 'admin-dashboard.html';
                btn.className = 'bb-btn bb-btn-outline bb-btn-sm';
                btn.style.marginRight = '0.5rem';
                btn.style.display = 'inline-flex';
                btn.style.alignItems = 'center';
                btn.style.gap = '0.25rem';
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.1rem">admin_panel_settings</span> <span class="nav-text">Admin</span>';

                // Insert before the first button or at the beginning
                headerActions.insertBefore(btn, headerActions.firstChild);
            }
        }
    } catch (e) {
        console.error('Session error:', e);
    }
}

// ── Global Error / Maintenance Handler ───────────────────────────────
// Enhanced global fetch wrapper:
// - If a request URL starts with `/api/` and `window.API_BASE` is defined,
//   the request will be prefixed with that base (useful when frontend and
//   API are hosted on different domains, e.g. Render).
// - Handles maintenance (503) redirects as before and logs fetch errors.
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    try {
        // Normalize args[0] to a string URL if Request provided
        let url = args[0];
        if (typeof url !== 'string' && url && url.url) url = url.url;

        if (typeof url === 'string' && url.startsWith('/api/')) {
            const base = (window.API_BASE || '').replace(/\/$/, '');
            if (base) {
                args[0] = base + url;
            }
            // otherwise leave as relative URL (works when API is on same origin)
        }

        const response = await originalFetch(...args);

        if (response.status === 503 && !window.location.pathname.includes('maintenance.html')) {
            const data = await response.clone().json().catch(() => null);
            if (data && data.maintenance) {
                window.location.href = (window.location.pathname.includes('/admin/') ? '../' : '') + 'maintenance.html';
            }
        }

        return response;
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
};

// ── Global Stats & Reset ─────────────────────────────────────────────
async function loadPublicStats() {
    const containers = {
        totalUsers: document.querySelector('[data-stat="totalUsers"]'),
        totalQuizzes: document.querySelector('[data-stat="totalQuizzes"]'),
        avgAccuracy: document.querySelector('[data-stat="avgAccuracy"]'),
        cheatRate: document.querySelector('[data-stat="cheatRate"]')
    };

    try {
        const res = await fetch('/api/stats/public');
        const data = await res.json();
        if (data.totalUsers !== undefined && containers.totalUsers) {
            containers.totalUsers.textContent = data.totalUsers.toLocaleString() + (data.totalUsers > 1000 ? '+' : '');
        }
        if (data.totalQuizzes !== undefined && containers.totalQuizzes) {
            containers.totalQuizzes.textContent = data.totalQuizzes.toLocaleString() + (data.totalQuizzes > 1000 ? '+' : '');
        }
        if (data.avgAccuracy !== undefined && containers.avgAccuracy) {
            containers.avgAccuracy.textContent = data.avgAccuracy + '%';
        }
        if (data.cheatRate !== undefined && containers.cheatRate) {
            containers.cheatRate.textContent = data.cheatRate;
        }
    } catch (e) { console.error('Stats load error', e); }
}

async function resetSystemData() {
    Confirm.ask(
        'RÉINITIALISATION COMPLÈTE',
        '⚠️ <span style="color:var(--bb-danger);font-weight:700">ATTENTION:</span> Cette action supprimera TOUS les utilisateurs (sauf vous), tous les scores et tous les logs. Les questions et catégories resteront intactes. Voulez-vous continuer ?',
        async () => {
            const token = sessionStorage.getItem('bb_token');
            try {
                const res = await fetch('/api/admin/system/reset-data', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    Toast.show(data.message, 'success', 5000);
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    Toast.show(data.message || 'Erreur lors du reset.', 'error');
                }
            } catch (e) { Toast.show('Erreur de connexion.', 'error'); }
        },
        true
    );
}

// Expose globals
window.loadPublicStats = loadPublicStats;
window.resetSystemData = resetSystemData;
window.Toast = Toast;
window.Modal = Modal;
window.Confirm = Confirm;
window.FormGuard = FormGuard;
window.updateNotificationBadge = updateNotificationBadge;
window.confirmLogout = confirmLogout;
