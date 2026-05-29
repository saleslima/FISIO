// Main application entry point
import { state, loadState } from './state.js';
import { renderCalendar, initializeUserPanel } from './calendar.js';
import { openBookingModal, showReport, showSearchBookings, searchBookingsByCpf } from './booking.js';
import { initializeAdminPanel } from './admin.js';
import { applyAppearanceConfig } from './appearance.js';
import { initializeModals, showCancellationModal, showStatistics } from './modals.js';


function setOfflineOverlayVisible(visible) {
    const overlay = document.getElementById('offlineOverlay');
    if (!overlay) return;
    overlay.hidden = !visible;
    document.body.classList.toggle('is-offline-open', visible);
}

function updateOfflineOverlay() {
    setOfflineOverlayVisible(!navigator.onLine || state.isOnline === false);
}

function initializeOfflineOverlay() {
    const retryBtn = document.getElementById('offlineRetryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            if (navigator.onLine) {
                window.location.reload();
            } else {
                setOfflineOverlayVisible(true);
            }
        });
    }

    window.addEventListener('appOffline', () => {
        setOfflineOverlayVisible(true);
    });

    if (!navigator.onLine) {
        setOfflineOverlayVisible(true);
    }
}


function startLogoIntroAnimation() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const target = document.querySelector('.header-content .logo-fiber-orbit');
    const targetLogo = target ? target.querySelector('img.logo') : null;
    if (!target || !targetLogo) return;

    const targetRect = target.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) return;

    const clone = target.cloneNode(true);
    clone.classList.add('logo-startup-clone');
    clone.setAttribute('aria-hidden', 'true');

    const cloneLogo = clone.querySelector('img.logo');
    if (cloneLogo) cloneLogo.src = targetLogo.src;

    clone.style.left = `${targetRect.left}px`;
    clone.style.top = `${targetRect.top}px`;
    clone.style.width = `${targetRect.width}px`;
    clone.style.height = `${targetRect.height}px`;

    document.body.appendChild(clone);
    document.body.classList.add('logo-intro-running');

    const viewportMin = Math.min(window.innerWidth, window.innerHeight);
    const desiredStartSize = window.innerWidth <= 768 ? viewportMin * 0.8 : Math.min(viewportMin * 0.55, 420);
    const scale = Math.max(1, desiredStartSize / Math.max(targetRect.width, targetRect.height));
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const startTranslateX = (window.innerWidth / 2) - targetCenterX;
    const startTranslateY = (window.innerHeight / 2) - targetCenterY;

    const animation = clone.animate([
        {
            transform: `translate(${startTranslateX}px, ${startTranslateY}px) scale(${scale})`,
            opacity: 1,
            offset: 0
        },
        {
            transform: `translate(${startTranslateX}px, ${startTranslateY}px) scale(${scale})`,
            opacity: 1,
            offset: 0.18
        },
        {
            transform: 'translate(0px, 0px) scale(1)',
            opacity: 1,
            offset: 0.86
        },
        {
            transform: 'translate(0px, 0px) scale(1)',
            opacity: 0,
            offset: 1
        }
    ], {
        duration: 3000,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
    });

    animation.finished.catch(() => null).then(() => {
        document.body.classList.remove('logo-intro-running');
        clone.remove();
    });
}


function initializeNeonCalendarControl() {
    const neonButton = document.getElementById('neonBorderBtn');
    const neonInput = document.getElementById('neonBorderColorInput');
    if (!neonButton || !neonInput) return;

    const savedColor = localStorage.getItem('calendarNeonBorderColor') || '#39ff14';
    const savedEnabled = localStorage.getItem('calendarNeonBorderEnabled') === 'true';

    neonInput.value = savedColor;
    document.documentElement.style.setProperty('--calendar-neon-border', savedColor);
    document.body.classList.toggle('neon-calendar-enabled', savedEnabled);
    neonButton.classList.toggle('active', savedEnabled);

    neonButton.addEventListener('click', () => {
        document.body.classList.add('neon-calendar-enabled');
        neonButton.classList.add('active');
        localStorage.setItem('calendarNeonBorderEnabled', 'true');
        neonInput.click();
    });

    neonInput.addEventListener('input', () => {
        const color = neonInput.value || '#39ff14';
        document.documentElement.style.setProperty('--calendar-neon-border', color);
        localStorage.setItem('calendarNeonBorderColor', color);
        document.body.classList.add('neon-calendar-enabled');
        neonButton.classList.add('active');
        localStorage.setItem('calendarNeonBorderEnabled', 'true');
    });

    neonButton.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        document.body.classList.remove('neon-calendar-enabled');
        neonButton.classList.remove('active');
        localStorage.setItem('calendarNeonBorderEnabled', 'false');
        window.showFmuNotice('Borda neon do calendário desativada. Clique no ícone neon para escolher uma nova cor.', 'Neon desativado');
    });
}

function initializeModeToggle() {
    const adminBtn = document.getElementById('adminModeBtn');
    const exitAdminBtn = document.getElementById('exitAdminBtn');
    const userBtn = document.getElementById('userModeBtn');
    const statisticsBtn = document.getElementById('statisticsBtn');
    const adminPanel = document.getElementById('adminPanel');
    const userPanel = document.getElementById('userPanel');
    const themeModeBtn = document.getElementById('themeModeBtn');

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Theme toggle
    themeModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });

    adminBtn.addEventListener('click', async () => {
        const password = await window.showFmuPasswordPrompt('Digite a senha de administrador:', 'Acesso Administrativo');
        if (password === null) return;
        if (password !== 'daqta') {
            window.showFmuNotice('Senha incorreta!', 'Acesso negado');
            return;
        }
        
        state.currentMode = 'admin';
        adminBtn.classList.add('active');
        adminBtn.style.display = 'none';
        exitAdminBtn.style.display = 'block';
        userBtn.classList.remove('active');
        adminPanel.classList.add('active');
        userPanel.classList.remove('active');
    });

    exitAdminBtn.addEventListener('click', () => {
        state.currentMode = 'user';
        adminBtn.classList.remove('active');
        adminBtn.style.display = 'block';
        exitAdminBtn.style.display = 'none';
        userBtn.classList.add('active');
        adminPanel.classList.remove('active');
        userPanel.classList.add('active');
    });

    statisticsBtn.addEventListener('click', async () => {
        const password = await window.showFmuPasswordPrompt('Digite a senha de administrador:', 'Acesso Administrativo');
        if (password === null) return;
        if (password !== 'daqta') {
            window.showFmuNotice('Senha incorreta!', 'Acesso negado');
            return;
        }
        showStatistics();
    });

    userBtn.addEventListener('click', () => {
        // Show patient search modal instead of switching to user panel
        window.dispatchEvent(new CustomEvent('showPatientSearch'));
    });
}

async function initApp() {
    console.log('🚀 Iniciando aplicação...');
    
    initializeOfflineOverlay();
    initializeModeToggle();
    initializeNeonCalendarControl();
    initializeAdminPanel();
    initializeUserPanel();
    initializeModals();
    
    // Set up custom event listeners
    window.addEventListener('stateUpdated', () => {
        applyAppearanceConfig();
        if (state.currentMode === 'user') {
            renderCalendar();
        }
    });

    window.addEventListener('openBookingModal', (e) => {
        openBookingModal(e.detail.day, e.detail.patient);
    });

    window.addEventListener('openBookingModalDirect', (e) => {
        openBookingModal(e.detail.day);
    });

    window.addEventListener('showReport', () => {
        showReport();
    });

    window.addEventListener('showReportWithFilter', (e) => {
        showReport(e.detail.filterDate);
    });

    window.addEventListener('showSearchBookings', () => {
        showSearchBookings();
    });
    
    window.addEventListener('performSearchBookings', () => {
        searchBookingsByCpf();
    });

    window.addEventListener('showCancellationModal', (e) => {
        showCancellationModal(e.detail.dateKey, e.detail.bookingIndex);
    });

    window.addEventListener('showPatientSearch', async () => {
        const { showPatientSearch } = await import('./modals.js');
        showPatientSearch();
    });

    window.addEventListener('openPatientBooking', (e) => {
        const patient = e.detail.patient;
        // Patient is verified, now let them choose day/period
        // We'll show a simplified calendar view that opens booking directly
        window.dispatchEvent(new CustomEvent('openBookingForPatient', { detail: { patient } }));
    });

    window.addEventListener('openBookingForPatient', (e) => {
        const patient = e.detail.patient;
        // Store patient data temporarily
        window.currentPatient = patient;
        // User should double-click calendar day to book
        window.showFmuNotice(`Olá ${patient.name}! Agora clique duas vezes no dia desejado no calendário para fazer sua reserva.`, 'Paciente localizado');
    });
    
    // Load state and wait for it to complete
    await loadState();
    
    // Render calendar after state is loaded
    if (state.isInitialized) {
        applyAppearanceConfig();
        renderCalendar();
        requestAnimationFrame(() => {
            startLogoIntroAnimation();
        });
        
        if (state.isOnline) {
            console.log('✓ Conectado ao banco de dados Firebase');
            setOfflineOverlayVisible(false);
        } else {
            console.log('❌ Sem conexão com Firebase');
            setOfflineOverlayVisible(true);
        }
    }
}

// Monitor online/offline status
window.addEventListener('online', async () => {
    console.log('🌐 Conexão restaurada');
    if (state.isInitialized) {
        const { loadFromFirebase } = await import('./state.js');
        await loadFromFirebase();
    }
    updateOfflineOverlay();
});

window.addEventListener('offline', () => {
    console.log('📵 Conexão perdida');
    state.isOnline = false;
    setOfflineOverlayVisible(true);
});

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}