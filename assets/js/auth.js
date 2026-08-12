/**
 * VESPERA INDUSTRIES - AUTHENTICATION ENGINE & UI CONTROLLER
 * Full client-side auth state management with session persistence,
 * validation, modal controller, profile dropdown, and i18n hooks.
 */

(function () {
    'use strict';

    // --- DEMO INITIAL USERS DATA SEED ---
    const INITIAL_USERS = [
        {
            id: 'usr_admin',
            name: 'Vespera Yöneticisi',
            email: 'admin@vesperaindustries.com',
            department: 'Vespera Core',
            passwordHash: 'vespera2026', // Plaintext for demo storage
            createdAt: new Date().toISOString()
        }
    ];

    // --- AUTH SERVICE LAYER ---
    const AuthService = {
        getUsers: function () {
            const data = localStorage.getItem('vespera_users');
            if (!data) {
                localStorage.setItem('vespera_users', JSON.stringify(INITIAL_USERS));
                return INITIAL_USERS;
            }
            try {
                return JSON.parse(data);
            } catch (e) {
                return INITIAL_USERS;
            }
        },

        saveUser: function (user) {
            const users = this.getUsers();
            users.push(user);
            localStorage.setItem('vespera_users', JSON.stringify(users));
        },

        getCurrentUser: function () {
            const local = localStorage.getItem('vespera_current_user');
            const session = sessionStorage.getItem('vespera_current_user');
            const raw = local || session;
            if (!raw) return null;
            try {
                return JSON.parse(raw);
            } catch (e) {
                return null;
            }
        },

        setCurrentUser: function (user, rememberMe) {
            const val = JSON.stringify(user);
            if (rememberMe) {
                localStorage.setItem('vespera_current_user', val);
                sessionStorage.removeItem('vespera_current_user');
            } else {
                sessionStorage.setItem('vespera_current_user', val);
                localStorage.removeItem('vespera_current_user');
            }
        },

        signIn: function (email, password, rememberMe) {
            const users = this.getUsers();
            const cleanEmail = email.trim().toLowerCase();
            const found = users.find(u => u.email.toLowerCase() === cleanEmail);

            if (!found) {
                return { success: false, messageKey: 'auth_err_not_found' };
            }
            if (found.passwordHash !== password) {
                return { success: false, messageKey: 'auth_err_invalid_pass' };
            }

            const sessionUser = {
                id: found.id,
                name: found.name,
                email: found.email,
                department: found.department
            };
            this.setCurrentUser(sessionUser, rememberMe);
            return { success: true, user: sessionUser };
        },

        signUp: function (name, email, department, password) {
            const users = this.getUsers();
            const cleanEmail = email.trim().toLowerCase();

            if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
                return { success: false, messageKey: 'auth_err_email_exists' };
            }

            const newUser = {
                id: 'usr_' + Date.now(),
                name: name.trim(),
                email: cleanEmail,
                department: department || 'Vespera Core',
                passwordHash: password,
                createdAt: new Date().toISOString()
            };

            this.saveUser(newUser);

            const sessionUser = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                department: newUser.department
            };
            this.setCurrentUser(sessionUser, true);
            return { success: true, user: sessionUser };
        },

        signOut: function () {
            localStorage.removeItem('vespera_current_user');
            sessionStorage.removeItem('vespera_current_user');
        }
    };

    // --- AUTH I18N DICTIONARY SUPPLEMENT ---
    const AuthI18n = {
        tr: {
            auth_nav_login: "Giriş Yap / Kaydol",
            auth_modal_login_tab: "Giriş Yap",
            auth_modal_signup_tab: "Kayıt Ol",
            auth_email_label: "E-Posta Adresi",
            auth_email_placeholder: "ornek@vesperaindustries.com",
            auth_password_label: "Şifre",
            auth_password_placeholder: "••••••••",
            auth_confirm_password_label: "Şifre Tekrar",
            auth_name_label: "Ad Soyad",
            auth_name_placeholder: "Ahmet Yılmaz",
            auth_dept_label: "Kurumsal Departman / Şirket",
            auth_remember_me: "Beni Hatırla",
            auth_forgot_pass: "Şifremi Unuttum?",
            auth_submit_login: "Giriş Yap",
            auth_submit_signup: "Hesap Oluştur",
            auth_strength_weak: "Zayıf",
            auth_strength_medium: "Orta",
            auth_strength_strong: "Güçlü",
            auth_pass_mismatch: "Şifreler eşleşmiyor!",
            auth_toast_login_success: "Hoş geldiniz! Giriş başarılı.",
            auth_toast_signup_success: "Hesabınız başarıyla oluşturuldu!",
            auth_toast_logout: "Oturum kapatıldı.",
            auth_err_not_found: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.",
            auth_err_invalid_pass: "Girdiğiniz şifre hatalı.",
            auth_err_email_exists: "Bu e-posta adresi zaten kullanımda.",
            auth_profile_menu: "Profilim",
            auth_security_menu: "Güvenlik",
            auth_logout_menu: "Çıkış Yap",
            auth_forgot_title: "Şifre Sıfırlama",
            auth_forgot_desc: "E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.",
            auth_forgot_submit: "Sıfırlama Bağlantısı Gönder",
            auth_back_to_login: "← Giriş Ekranına Dön",
            auth_toast_reset_sent: "Sıfırlama bağlantısı e-posta adresinize gönderildi."
        },
        en: {
            auth_nav_login: "Sign In / Register",
            auth_modal_login_tab: "Sign In",
            auth_modal_signup_tab: "Sign Up",
            auth_email_label: "Email Address",
            auth_email_placeholder: "name@vesperaindustries.com",
            auth_password_label: "Password",
            auth_password_placeholder: "••••••••",
            auth_confirm_password_label: "Confirm Password",
            auth_name_label: "Full Name",
            auth_name_placeholder: "John Doe",
            auth_dept_label: "Corporate Department / Division",
            auth_remember_me: "Remember Me",
            auth_forgot_pass: "Forgot Password?",
            auth_submit_login: "Sign In",
            auth_submit_signup: "Create Account",
            auth_strength_weak: "Weak",
            auth_strength_medium: "Medium",
            auth_strength_strong: "Strong",
            auth_pass_mismatch: "Passwords do not match!",
            auth_toast_login_success: "Welcome back! Signed in successfully.",
            auth_toast_signup_success: "Account created successfully!",
            auth_toast_logout: "Signed out successfully.",
            auth_err_not_found: "No account found with this email address.",
            auth_err_invalid_pass: "Incorrect password provided.",
            auth_err_email_exists: "This email address is already registered.",
            auth_profile_menu: "My Profile",
            auth_security_menu: "Security",
            auth_logout_menu: "Sign Out",
            auth_forgot_title: "Reset Password",
            auth_forgot_desc: "Enter your email address to receive a password reset link.",
            auth_forgot_submit: "Send Reset Link",
            auth_back_to_login: "← Back to Sign In",
            auth_toast_reset_sent: "Password reset link has been sent to your email."
        }
    };

    function getLang() {
        return localStorage.getItem('vespera-lang') || 'tr';
    }

    function getText(key) {
        const lang = getLang();
        if (AuthI18n[lang] && AuthI18n[lang][key]) {
            return AuthI18n[lang][key];
        }
        return AuthI18n['tr'][key] || key;
    }

    // --- UI CONTROLLER & MODAL INJECTION ---
    const UIController = {
        init: function () {
            this.injectModalHTML();
            this.injectToastContainer();
            this.bindEvents();
            this.updateNavbarUI();
            this.listenToLanguageChanges();
        },

        injectToastContainer: function () {
            if (!document.getElementById('vespera-toast-container')) {
                const toastContainer = document.createElement('div');
                toastContainer.id = 'vespera-toast-container';
                document.body.appendChild(toastContainer);
            }
        },

        showToast: function (message, type = 'toast-info') {
            this.injectToastContainer();
            const container = document.getElementById('vespera-toast-container');
            const toast = document.createElement('div');
            toast.className = `vespera-toast ${type}`;

            let iconSvg = '';
            if (type === 'toast-success') {
                iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
            } else if (type === 'toast-error') {
                iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
            } else {
                iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
            }

            toast.innerHTML = `${iconSvg} <span>${message}</span>`;
            container.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        },

        injectModalHTML: function () {
            if (document.getElementById('authModalOverlay')) return;

            const modalHTML = `
            <div class="auth-modal-overlay" id="authModalOverlay">
                <div class="auth-modal-container">
                    <div class="auth-modal-header">
                        <button class="auth-modal-close" id="authModalClose" aria-label="Kapat">✕</button>
                        <div class="auth-brand-badge">
                            <img src="assets/img/logos.png" alt="Vespera" class="auth-brand-logo">
                        </div>
                        <div class="auth-tabs" id="authTabs">
                            <button class="auth-tab-btn active" data-tab="login" data-auth-i18n="auth_modal_login_tab">${getText('auth_modal_login_tab')}</button>
                            <button class="auth-tab-btn" data-tab="signup" data-auth-i18n="auth_modal_signup_tab">${getText('auth_modal_signup_tab')}</button>
                        </div>
                    </div>

                    <div class="auth-modal-body">
                        <div class="auth-alert" id="authModalAlert"></div>

                        <!-- LOGIN FORM -->
                        <form class="auth-form active" id="loginForm">
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_email_label">${getText('auth_email_label')}</label>
                                <div class="input-with-icon">
                                    <input type="email" id="loginEmail" required placeholder="${getText('auth_email_placeholder')}">
                                </div>
                            </div>
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_password_label">${getText('auth_password_label')}</label>
                                <div class="input-with-icon">
                                    <input type="password" id="loginPassword" required placeholder="${getText('auth_password_placeholder')}">
                                    <button type="button" class="toggle-password-btn" data-target="loginPassword">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="auth-form-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="loginRemember" checked>
                                    <span data-auth-i18n="auth_remember_me">${getText('auth_remember_me')}</span>
                                </label>
                                <a href="#" class="forgot-link" id="forgotPassLink" data-auth-i18n="auth_forgot_pass">${getText('auth_forgot_pass')}</a>
                            </div>
                            <button type="submit" class="auth-submit-btn" data-auth-i18n="auth_submit_login">${getText('auth_submit_login')}</button>
                        </form>

                        <!-- SIGNUP FORM -->
                        <form class="auth-form" id="signupForm">
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_name_label">${getText('auth_name_label')}</label>
                                <input type="text" id="signupName" required placeholder="${getText('auth_name_placeholder')}">
                            </div>
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_email_label">${getText('auth_email_label')}</label>
                                <input type="email" id="signupEmail" required placeholder="${getText('auth_email_placeholder')}">
                            </div>
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_dept_label">${getText('auth_dept_label')}</label>
                                <select id="signupDept">
                                    <option value="Vespera Core">Vespera Core Systems</option>
                                    <option value="Vespera Cyber Security">Vespera Cyber Security</option>
                                    <option value="Vespera Interactive & Game Studio">Vespera Interactive & Game Studio</option>
                                    <option value="Vespera Logistics & Fleet Control">Vespera Logistics & Fleet Control</option>
                                    <option value="Vespera R&D Lab">Vespera R&D Lab</option>
                                </select>
                            </div>
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_password_label">${getText('auth_password_label')}</label>
                                <div class="input-with-icon">
                                    <input type="password" id="signupPassword" required placeholder="${getText('auth_password_placeholder')}">
                                    <button type="button" class="toggle-password-btn" data-target="signupPassword">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                </div>
                                <div class="password-strength-container">
                                    <div class="strength-bar-bg"><div class="strength-bar-fill" id="strengthBar"></div></div>
                                    <div class="strength-text" id="strengthText"></div>
                                </div>
                            </div>
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_confirm_password_label">${getText('auth_confirm_password_label')}</label>
                                <div class="input-with-icon">
                                    <input type="password" id="signupConfirmPassword" required placeholder="${getText('auth_password_placeholder')}">
                                </div>
                            </div>
                            <button type="submit" class="auth-submit-btn" data-auth-i18n="auth_submit_signup">${getText('auth_submit_signup')}</button>
                        </form>

                        <!-- FORGOT PASSWORD FORM -->
                        <form class="auth-form" id="forgotForm">
                            <h4 style="margin-bottom:6px; font-weight:700;" data-auth-i18n="auth_forgot_title">${getText('auth_forgot_title')}</h4>
                            <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;" data-auth-i18n="auth_forgot_desc">${getText('auth_forgot_desc')}</p>
                            <div class="auth-form-group">
                                <label data-auth-i18n="auth_email_label">${getText('auth_email_label')}</label>
                                <input type="email" id="forgotEmail" required placeholder="${getText('auth_email_placeholder')}">
                            </div>
                            <button type="submit" class="auth-submit-btn" data-auth-i18n="auth_forgot_submit">${getText('auth_forgot_submit')}</button>
                            <a href="#" id="backToLoginLink" style="display:inline-block; margin-top:10px; font-size:13px; color:var(--primary-color); text-decoration:none;" data-auth-i18n="auth_back_to_login">${getText('auth_back_to_login')}</a>
                        </form>

                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
        },

        bindEvents: function () {
            const overlay = document.getElementById('authModalOverlay');
            const closeBtn = document.getElementById('authModalClose');

            if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) this.closeModal();
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
                    this.closeModal();
                }
            });

            // Tab switching
            const tabs = document.querySelectorAll('#authTabs .auth-tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.getAttribute('data-tab');
                    this.switchTab(tabName);
                });
            });

            // Password visibility toggle
            document.querySelectorAll('.toggle-password-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.getAttribute('data-target');
                    const input = document.getElementById(targetId);
                    if (input) {
                        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                        input.setAttribute('type', type);
                    }
                });
            });

            // Password Strength Meter
            const signupPass = document.getElementById('signupPassword');
            if (signupPass) {
                signupPass.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
            }

            // Forms Submit
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            const signupForm = document.getElementById('signupForm');
            if (signupForm) {
                signupForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSignup();
                });
            }

            const forgotLink = document.getElementById('forgotPassLink');
            if (forgotLink) {
                forgotLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showForgotForm();
                });
            }

            const backToLogin = document.getElementById('backToLoginLink');
            if (backToLogin) {
                backToLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab('login');
                });
            }

            const forgotForm = document.getElementById('forgotForm');
            if (forgotForm) {
                forgotForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.showAlert('success', getText('auth_toast_reset_sent'));
                    this.showToast(getText('auth_toast_reset_sent'), 'toast-success');
                    setTimeout(() => this.switchTab('login'), 2000);
                });
            }
        },

        checkPasswordStrength: function (val) {
            const bar = document.getElementById('strengthBar');
            const text = document.getElementById('strengthText');
            if (!bar || !text) return;

            if (!val) {
                bar.style.width = '0%';
                text.textContent = '';
                return;
            }

            let score = 0;
            if (val.length >= 6) score += 1;
            if (val.length >= 10) score += 1;
            if (/[A-Z]/.test(val)) score += 1;
            if (/[0-9]/.test(val)) score += 1;
            if (/[^A-Za-z0-9]/.test(val)) score += 1;

            if (score <= 2) {
                bar.style.width = '33%';
                bar.style.backgroundColor = '#ef4444';
                text.textContent = getText('auth_strength_weak');
                text.style.color = '#ef4444';
            } else if (score <= 4) {
                bar.style.width = '66%';
                bar.style.backgroundColor = '#eab308';
                text.textContent = getText('auth_strength_medium');
                text.style.color = '#eab308';
            } else {
                bar.style.width = '100%';
                bar.style.backgroundColor = '#22c55e';
                text.textContent = getText('auth_strength_strong');
                text.style.color = '#22c55e';
            }
        },

        switchTab: function (tabName) {
            const tabs = document.querySelectorAll('#authTabs .auth-tab-btn');
            const forms = document.querySelectorAll('.auth-form');
            const tabsHeader = document.getElementById('authTabs');

            if (tabsHeader) tabsHeader.style.display = 'flex';
            this.clearAlert();

            tabs.forEach(t => {
                if (t.getAttribute('data-tab') === tabName) {
                    t.classList.add('active');
                } else {
                    t.classList.remove('active');
                }
            });

            forms.forEach(f => {
                if (f.id === tabName + 'Form') {
                    f.classList.add('active');
                } else {
                    f.classList.remove('active');
                }
            });
        },

        showForgotForm: function () {
            const tabsHeader = document.getElementById('authTabs');
            const forms = document.querySelectorAll('.auth-form');
            if (tabsHeader) tabsHeader.style.display = 'none';

            this.clearAlert();
            forms.forEach(f => f.classList.remove('active'));
            const forgotForm = document.getElementById('forgotForm');
            if (forgotForm) forgotForm.classList.add('active');
        },

        openModal: function (initialTab = 'login') {
            const overlay = document.getElementById('authModalOverlay');
            if (overlay) {
                this.switchTab(initialTab);
                overlay.classList.add('open');
            }
        },

        closeModal: function () {
            const overlay = document.getElementById('authModalOverlay');
            if (overlay) {
                overlay.classList.remove('open');
                this.clearAlert();
            }
        },

        showAlert: function (type, msg) {
            const alertBox = document.getElementById('authModalAlert');
            if (alertBox) {
                alertBox.className = `auth-alert ${type}`;
                alertBox.textContent = msg;
            }
        },

        clearAlert: function () {
            const alertBox = document.getElementById('authModalAlert');
            if (alertBox) {
                alertBox.className = 'auth-alert';
                alertBox.textContent = '';
            }
        },

        handleLogin: function () {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('loginRemember').checked;

            const res = AuthService.signIn(email, password, rememberMe);
            if (res.success) {
                this.closeModal();
                this.updateNavbarUI();
                this.showToast(getText('auth_toast_login_success'), 'toast-success');
            } else {
                this.showAlert('error', getText(res.messageKey));
            }
        },

        handleSignup: function () {
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const dept = document.getElementById('signupDept').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPass = document.getElementById('signupConfirmPassword').value;

            if (password !== confirmPass) {
                this.showAlert('error', getText('auth_pass_mismatch'));
                return;
            }

            const res = AuthService.signUp(name, email, dept, password);
            if (res.success) {
                this.closeModal();
                this.updateNavbarUI();
                this.showToast(getText('auth_toast_signup_success'), 'toast-success');
            } else {
                this.showAlert('error', getText(res.messageKey));
            }
        },

        handleLogout: function () {
            AuthService.signOut();
            this.updateNavbarUI();
            this.showToast(getText('auth_toast_logout'), 'toast-info');
        },

        updateNavbarUI: function () {
            const navRight = document.querySelector('.nav-right');
            if (!navRight) return;

            let authContainer = document.getElementById('navAuthContainer');
            if (!authContainer) {
                authContainer = document.createElement('div');
                authContainer.id = 'navAuthContainer';
            }
            // Append at the end of navRight (after themeBtn and langBtn)
            navRight.appendChild(authContainer);

            const currentUser = AuthService.getCurrentUser();

            if (currentUser) {
                // Logged In UI
                const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                authContainer.innerHTML = `
                <div class="user-profile-wrap">
                    <button class="user-profile-btn" id="userProfileBtn" onclick="VesperaAuth.toggleProfileDropdown()">
                        <div class="user-avatar">${initials}</div>
                        <span class="user-name">${currentUser.name}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="user-dropdown-header">
                            <div class="user-dropdown-name">${currentUser.name}</div>
                            <div class="user-dropdown-email">${currentUser.email}</div>
                            <div class="user-dropdown-dept">${currentUser.department || 'Vespera Core'}</div>
                        </div>
                        <div class="user-dropdown-menu">
                            <button class="user-dropdown-item" onclick="VesperaAuth.showToast('${currentUser.name} - ${currentUser.department}', 'toast-info')">
                                👤 <span data-auth-i18n="auth_profile_menu">${getText('auth_profile_menu')}</span>
                            </button>
                            <button class="user-dropdown-item" onclick="VesperaAuth.openModal('login')">
                                🔒 <span data-auth-i18n="auth_security_menu">${getText('auth_security_menu')}</span>
                            </button>
                            <button class="user-dropdown-item logout" onclick="VesperaAuth.handleLogout()">
                                🚪 <span data-auth-i18n="auth_logout_menu">${getText('auth_logout_menu')}</span>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            } else {
                // Logged Out UI
                authContainer.innerHTML = `
                <button class="auth-nav-btn" onclick="VesperaAuth.openModal('login')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    <span data-auth-i18n="auth_nav_login">${getText('auth_nav_login')}</span>
                </button>
                `;
            }
        },

        toggleProfileDropdown: function () {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.classList.toggle('open');
        },

        updateTranslations: function () {
            document.querySelectorAll('[data-auth-i18n]').forEach(el => {
                const key = el.getAttribute('data-auth-i18n');
                if (key) {
                    el.textContent = getText(key);
                }
            });

            // Update placeholders
            const emailIn = document.getElementById('loginEmail');
            if (emailIn) emailIn.placeholder = getText('auth_email_placeholder');
            const passIn = document.getElementById('loginPassword');
            if (passIn) passIn.placeholder = getText('auth_password_placeholder');
            const signupName = document.getElementById('signupName');
            if (signupName) signupName.placeholder = getText('auth_name_placeholder');
        },

        listenToLanguageChanges: function () {
            // Document click to close profile dropdown
            document.addEventListener('click', (e) => {
                const profileWrap = document.querySelector('.user-profile-wrap');
                if (profileWrap && !profileWrap.contains(e.target)) {
                    const dropdown = document.getElementById('userDropdown');
                    if (dropdown) dropdown.classList.remove('open');
                }
            });

            // Hook into window.setLanguage if page calls it
            const originalSetLang = window.setLanguage;
            window.setLanguage = (lang) => {
                if (typeof originalSetLang === 'function') {
                    originalSetLang(lang);
                }
                this.updateTranslations();
                this.updateNavbarUI();
            };
        }
    };

    // Public API
    window.VesperaAuth = {
        openModal: (tab) => UIController.openModal(tab),
        closeModal: () => UIController.closeModal(),
        handleLogout: () => UIController.handleLogout(),
        toggleProfileDropdown: () => UIController.toggleProfileDropdown(),
        showToast: (msg, type) => UIController.showToast(msg, type),
        getCurrentUser: () => AuthService.getCurrentUser()
    };

    // Auto Init on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UIController.init());
    } else {
        UIController.init();
    }

})();
