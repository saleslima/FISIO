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

    adminBtn.addEventListener('click', () => {
        const password = prompt('Digite a senha de administrador:');
        if (password !== 'daqta') {
            alert('Senha incorreta!');
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

    statisticsBtn.addEventListener('click', () => {
        const password = prompt('Digite a senha de administrador:');
        if (password !== 'daqta') {
            alert('Senha incorreta!');
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
        alert(`Olá ${patient.name}! Agora clique duas vezes no dia desejado no calendário para fazer sua reserva.`);
    });
    
    // Load state and wait for it to complete
    await loadState();
    
    // Render calendar after state is loaded
    if (state.isInitialized) {
        applyAppearanceConfig();
        renderCalendar();
        
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