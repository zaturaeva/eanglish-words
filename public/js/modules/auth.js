import api from '../api.js';
import router from '../router.js';

export function renderLogin() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div class="form-container">
            <h2>Вход</h2>
            <form id="login-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="login-password" required minlength="6">
                </div>
                <div id="login-error" class="error-message" style="display:none;"></div>
                <button type="submit" class="btn btn-primary">Войти</button>
            </form>
            <p class="form-link">
                Нет аккаунта? <a id="link-register">Зарегистрироваться</a>
            </p>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            errorEl.style.display = 'none';
            const data = await api.post('/auth/login', { email, password });
            api.setToken(data.token);
            if (data.user.target) {
                router.navigate('dashboard');
            } else {
                router.navigate('onboarding');
            }
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });

    document.getElementById('link-register').addEventListener('click', () => {
        router.navigate('register');
    });
}

export function renderRegister() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
        <div class="form-container">
            <h2>Регистрация</h2>
            <form id="register-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="reg-email" required>
                </div>
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="reg-password" required minlength="6">
                </div>
                <div class="form-group">
                    <label>Подтверждение пароля</label>
                    <input type="password" id="reg-password-confirm" required minlength="6">
                </div>
                <div id="reg-error" class="error-message" style="display:none;"></div>
                <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
            </form>
            <p class="form-link">
                Уже есть аккаунт? <a id="link-login">Войти</a>
            </p>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-password-confirm').value;
        const errorEl = document.getElementById('reg-error');

        if (password !== confirm) {
            errorEl.textContent = 'Пароли не совпадают';
            errorEl.style.display = 'block';
            return;
        }

        try {
            errorEl.style.display = 'none';
            const data = await api.post('/auth/register', { email, password });
            api.setToken(data.token);
            router.navigate('onboarding');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });

    document.getElementById('link-login').addEventListener('click', () => {
        router.navigate('login');
    });
}