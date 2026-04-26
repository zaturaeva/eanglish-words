class Router {
    constructor() {
        this.routes = {};
        this.currentCleanup = null;
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    addRoute(name, handler) {
        this.routes[name] = handler;
    }

    navigate(name) {
        window.location.hash = '#' + name;
    }

    handleRoute() {
        var hash = window.location.hash.slice(1) || 'login';
        var name = hash.split('?')[0];

        if (this.currentCleanup && typeof this.currentCleanup === 'function') {
            this.currentCleanup();
        }

        var handler = this.routes[name];
        if (handler) {
            var nav = document.getElementById('main-nav');
            if (['login', 'register', 'onboarding'].indexOf(name) !== -1) {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
            }
            document.querySelectorAll('.nav-links a').forEach(function(link) {
                link.classList.toggle('active', link.dataset.route === name);
            });
            return handler();
        } else {
            if (this.routes['login']) {
                return this.routes['login']();
            }
        }
    }
}

export default new Router();