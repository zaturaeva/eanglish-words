import router from './router.js';
import api from './api.js';
import { renderLogin, renderRegister } from './modules/auth.js';
import { renderOnboarding } from './modules/onboarding.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderCatalog } from './modules/catalog.js';
import { renderDictionary } from './modules/dictionary.js';
import { renderStats } from './modules/stats.js';

document.addEventListener('DOMContentLoaded', function() {

    var logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            api.clearToken();
            router.navigate('login');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            router.navigate(link.dataset.route);
        });
    });

    router.addRoute('login', renderLogin);
    router.addRoute('register', renderRegister);
    router.addRoute('onboarding', renderOnboarding);
    router.addRoute('dashboard', renderDashboard);
    router.addRoute('catalog', renderCatalog);
    router.addRoute('dictionary', renderDictionary);
    router.addRoute('stats', renderStats);

    router.handleRoute();
});