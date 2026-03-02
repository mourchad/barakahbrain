/**
 * BarakahBrain — Shared Layouts (Pro Component System)
 * Centralizes the premium header and footer to ensure consistency across all pages.
 */

const BARAKAH_LAYOUT = {
    getHeader(activePage = '') {
        const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('BarakahBrain/');
        const prefix = isHome ? '' : 'index.html';

        return `
            <header class="bb-header">
                <div class="bb-header__inner" style="max-width: 80rem; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between;">
                    <a href="index.html" class="bb-header__brand">
                        <img src="assets/logo_BarakahBrain.png" alt="BarakahBrain" />
                        <span class="bb-header__name">BarakahBrain</span>
                    </a>
                    <nav class="bb-nav__links">
                        <a href="${prefix}#excellence-path" class="bb-nav__link ${activePage === 'leaderboard' ? 'bb-nav__link--active' : ''}" data-i18n="nav_leaderboard">Parcours</a>
                        <a href="${prefix}#features" class="bb-nav__link ${activePage === 'about' ? 'bb-nav__link--active' : ''}" data-i18n="nav_about">À propos</a>
                        <a href="faq.html" class="bb-nav__link ${activePage === 'faq' ? 'bb-nav__link--active' : ''}">FAQ</a>
                        <a href="contact.html" class="bb-nav__link ${activePage === 'contact' ? 'bb-nav__link--active' : ''}">Contact</a>
                    </nav>
                    <div class="bb-header__actions">
                        <div class="bb-lang-switch" title="Langue">
                            <button class="lang-btn lang-btn--active" data-lang="fr">FR</button>
                            <button class="lang-btn" data-lang="en">EN</button>
                            <button class="lang-btn" data-lang="ar">ع</button>
                        </div>
                        <a href="connexion.html" class="bb-btn bb-btn-ghost" data-i18n="nav_login">Se connecter</a>
                        <a href="inscription.html" class="bb-btn bb-btn-primary" data-i18n="nav_register">S'inscrire</a>
                    </div>
                    <button type="button" class="bb-hamburger bb-icon-btn" aria-label="Menu" id="bb-nav-toggle">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>
            <div class="bb-nav-overlay" id="bb-nav-overlay" aria-hidden="true"></div>
            <div class="bb-nav-drawer" id="bb-nav-drawer" aria-hidden="true">
                <nav class="bb-nav__links">
                    <a href="index.html" class="bb-nav__link" data-i18n="nav_home">Accueil</a>
                    <a href="${prefix}#excellence-path" class="bb-nav__link" data-i18n="nav_leaderboard">Parcours</a>
                    <a href="${prefix}#features" class="bb-nav__link" data-i18n="nav_about">À propos</a>
                    <a href="classement.html" class="bb-nav__link" data-i18n="nav_leaderboard_page">Classement</a>
                    <a href="faq.html" class="bb-nav__link" data-i18n="nav_faq">FAQ</a>
                    <a href="contact.html" class="bb-nav__link" data-i18n="nav_contact">Contact</a>
                </nav>
                <div class="bb-header__actions">
                    <div class="bb-lang-switch">
                        <button class="lang-btn lang-btn--active" data-lang="fr">FR</button>
                        <button class="lang-btn" data-lang="en">EN</button>
                        <button class="lang-btn" data-lang="ar">ع</button>
                    </div>
                    <a href="connexion.html" class="bb-btn bb-btn-ghost bb-btn-full" data-i18n="nav_login">Se connecter</a>
                    <a href="inscription.html" class="bb-btn bb-btn-primary bb-btn-full" data-i18n="nav_register">S'inscrire</a>
                </div>
            </div>
        `;
    },

    getFooter() {
        return `
            <footer class="bb-page-footer" style="background:var(--bb-bg);border-top:1px solid var(--bb-border);padding:2.5rem 1.5rem; position: relative; overflow: hidden;">
                <div class="hero-glow-2" style="opacity: 0.05; bottom: -10%; right: -10%;"></div>
                <div style="max-width:64rem;margin:0 auto; position: relative; z-index: 2;">
                    <div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:2rem">
                        <div style="max-width: 20rem;">
                            <a href="index.html" class="bb-header__brand" style="margin-bottom: 1.5rem;">
                                <img src="assets/logo_BarakahBrain.png" alt="BarakahBrain" style="width: 2.5rem; height: 2.5rem;" />
                                <span class="bb-header__name">BarakahBrain</span>
                            </a>
                            <p style="font-size: 0.875rem; color: var(--bb-text-muted); line-height: 1.6;" data-i18n="footer_tagline">
                                L’excellence du savoir islamique au service de la performance intellectuelle moderne. Éveillez votre Barakah intérieure.
                            </p>
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 3rem; flex: 1; justify-items: end;">
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <span style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; color: var(--bb-gold); text-transform: uppercase;" data-i18n="footer_col1_title">Plateforme</span>
                                <a href="index.html#features" style="font-size:.875rem;color:var(--bb-text-muted); text-decoration: none;" data-i18n="footer_col1_item1">Fonctionnalités</a>
                                <a href="classement.html" style="font-size:.875rem;color:var(--bb-text-muted); text-decoration: none;" data-i18n="footer_col1_item2">Classement</a>
                                <a href="faq.html" style="font-size:.875rem;color:var(--bb-text-muted); text-decoration: none;" data-i18n="footer_col1_item3">FAQ / Aide</a>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <span style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; color: var(--bb-gold); text-transform: uppercase;" data-i18n="footer_col2_title">Légal</span>
                                <a href="politique.html" style="font-size:.875rem;color:var(--bb-text-muted); text-decoration: none;" data-i18n="footer_col2_item1">Conditions</a>
                                <a href="politique.html" style="font-size:.875rem;color:var(--bb-text-muted); text-decoration: none;" data-i18n="footer_col2_item2">Confidentialité</a>
                                <a href="contact.html" style="font-size:.875rem;color:var(--bb-text-muted); text-decoration: none;" data-i18n="footer_col2_item3">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:2rem; padding-top: 1.5rem; border-top: 1px solid var(--bb-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <p style="font-size:.75rem;color:var(--bb-text-subtle)">© 2025 BarakahBrain. <span data-i18n="footer_rights">Tous droits réservés.</span></p>
                        <div style="display: flex; gap: 1.5rem;">
                            <span style="font-size: 0.7rem; font-weight: 600; color: var(--bb-text-subtle); display: flex; align-items: center; gap: 0.5rem;">
                                <span class="material-symbols-outlined" style="font-size: 1rem;">language</span> FR / EN / AR
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    },

    render() {
        const headerPlaceholder = document.getElementById('bb-header-global');
        const footerPlaceholder = document.getElementById('bb-footer-global');

        if (headerPlaceholder) {
            const active = headerPlaceholder.getAttribute('data-active') || '';
            headerPlaceholder.outerHTML = this.getHeader(active);
            this.initMobileNav();
        }

        if (footerPlaceholder) {
            footerPlaceholder.outerHTML = this.getFooter();
        }

        // Trigger i18n update if available (from i18n.js)
        if (typeof I18n !== 'undefined' && typeof I18n.applyTranslations === 'function') {
            I18n.applyTranslations();
        }
    },

    initMobileNav() {
        const toggle = document.getElementById('bb-nav-toggle');
        const overlay = document.getElementById('bb-nav-overlay');
        const drawer = document.getElementById('bb-nav-drawer');
        if (!toggle || !overlay || !drawer) return;

        const open = () => {
            overlay.classList.add('bb-nav-overlay--open');
            drawer.classList.add('bb-nav-drawer--open');
            document.body.style.overflow = 'hidden';
            overlay.setAttribute('aria-hidden', 'false');
            drawer.setAttribute('aria-hidden', 'false');
        };
        const close = () => {
            overlay.classList.remove('bb-nav-overlay--open');
            drawer.classList.remove('bb-nav-drawer--open');
            document.body.style.overflow = '';
            overlay.setAttribute('aria-hidden', 'true');
            drawer.setAttribute('aria-hidden', 'true');
        };

        toggle.addEventListener('click', () => (drawer.classList.contains('bb-nav-drawer--open') ? close() : open()));
        overlay.addEventListener('click', close);
        drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    }
};

// Auto-render on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BARAKAH_LAYOUT.render());
} else {
    BARAKAH_LAYOUT.render();
}
