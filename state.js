// Application state management module
import { firebaseDB, isFirebaseAvailable, waitForFirebase } from './firebase.js';

export const state = {
    currentMode: 'user',
    configurations: {},
    bookings: {},
    blockedDays: {},
    customDayConfigurations: {},
    bookingPassword: null,
    registeredPatients: {},
    emailConfig: null,
    appearanceConfig: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    blockedCalendarMonth: new Date().getMonth(),
    blockedCalendarYear: new Date().getFullYear(),
    customizeCalendarMonth: new Date().getMonth(),
    customizeCalendarYear: new Date().getFullYear(),
    isOnline: false,
    syncInProgress: false,
    isInitialized: false,
};

function normalizeEmailConfig(config) {
    if (!config || typeof config !== 'object') return null;

    const looksLikeEmailJs = config.provider === 'emailjs' || config.publicKey || config.serviceId || config.templateId;
    if (!looksLikeEmailJs) {
        // Ignore legacy SMTP settings so Gmail/App passwords are not kept in the front-end app.
        return null;
    }

    return {
        provider: 'emailjs',
        publicKey: String(config.publicKey || '').trim(),
        serviceId: String(config.serviceId || '').trim(),
        templateId: String(config.templateId || '').trim(),
        fromName: String(config.fromName || 'FMU').trim() || 'FMU',
        replyTo: String(config.replyTo || '').trim(),
        adminEmail: String(config.adminEmail || '').trim(),
        autoSend: config.autoSend !== false
    };
}

export function normalizeAppearanceConfig(config) {
    if (!config || typeof config !== 'object') return null;

    return {
        logoDataUrl: String(config.logoDataUrl || '').trim(),
        backgroundDataUrl: String(config.backgroundDataUrl || '').trim()
    };
}

export function loadFromLocalStorage() {
    try {
        const savedConfig = localStorage.getItem('festasConfig');
        const savedBookings = localStorage.getItem('festasBookings');
        const savedBlockedDays = localStorage.getItem('festasBlockedDays');
        const savedCustomDayConfigurations = localStorage.getItem('festasCustomDayConfigurations');
        const savedBookingPassword = localStorage.getItem('festasBookingPassword');
        const savedRegisteredPatients = localStorage.getItem('festasRegisteredPatients');
        const savedEmailConfig = localStorage.getItem('festasEmailConfig');
        const savedAppearanceConfig = localStorage.getItem('festasAppearanceConfig');

        if (savedConfig) state.configurations = JSON.parse(savedConfig);
        if (savedBookings) state.bookings = JSON.parse(savedBookings);
        if (savedBlockedDays) state.blockedDays = JSON.parse(savedBlockedDays);
        if (savedCustomDayConfigurations) state.customDayConfigurations = JSON.parse(savedCustomDayConfigurations);
        if (savedBookingPassword) state.bookingPassword = JSON.parse(savedBookingPassword);
        if (savedRegisteredPatients) state.registeredPatients = JSON.parse(savedRegisteredPatients);
        if (savedEmailConfig) state.emailConfig = normalizeEmailConfig(JSON.parse(savedEmailConfig));
        if (savedAppearanceConfig) state.appearanceConfig = normalizeAppearanceConfig(JSON.parse(savedAppearanceConfig));

        console.log('✓ Dados carregados do localStorage');
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

export function saveToLocalStorage() {
    try {
        localStorage.setItem('festasConfig', JSON.stringify(state.configurations));
        localStorage.setItem('festasBookings', JSON.stringify(state.bookings));
        localStorage.setItem('festasBlockedDays', JSON.stringify(state.blockedDays));
        localStorage.setItem('festasCustomDayConfigurations', JSON.stringify(state.customDayConfigurations));
        localStorage.setItem('festasBookingPassword', JSON.stringify(state.bookingPassword));
        localStorage.setItem('festasRegisteredPatients', JSON.stringify(state.registeredPatients));
        localStorage.setItem('festasEmailConfig', JSON.stringify(normalizeEmailConfig(state.emailConfig)));
        localStorage.setItem('festasAppearanceConfig', JSON.stringify(normalizeAppearanceConfig(state.appearanceConfig)));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

export async function loadFromFirebase() {
    // Wait for Firebase to be ready
    const isReady = await waitForFirebase();
    
    if (!isReady || !isFirebaseAvailable()) {
        console.error('❌ Firebase não está disponível');
        state.isOnline = false;
        state.isInitialized = true;
        window.dispatchEvent(new CustomEvent('appOffline'));
        return;
    }

    try {
        console.log('🔄 Conectando ao Firebase...');

        const db = firebaseDB;
        const configurationsRef = db.ref('configurations');
        const bookingsRef = db.ref('bookings');
        const blockedDaysRef = db.ref('blockedDays');
        const customDayConfigurationsRef = db.ref('customDayConfigurations');
        const bookingPasswordRef = db.ref('bookingPassword');
        const registeredPatientsRef = db.ref('registeredPatients');
        const emailConfigRef = db.ref('emailConfig');
        const appearanceConfigRef = db.ref('appearanceConfig');

        const [configurationsSnapshot, bookingsSnapshot, blockedDaysSnapshot, customDayConfigurationsSnapshot, bookingPasswordSnapshot, registeredPatientsSnapshot, emailConfigSnapshot, appearanceConfigSnapshot] = await Promise.all([
            configurationsRef.once('value'),
            bookingsRef.once('value'),
            blockedDaysRef.once('value'),
            customDayConfigurationsRef.once('value'),
            bookingPasswordRef.once('value'),
            registeredPatientsRef.once('value'),
            emailConfigRef.once('value'),
            appearanceConfigRef.once('value')
        ]);

        if (configurationsSnapshot.exists()) {
            state.configurations = configurationsSnapshot.val();
            console.log('✓ Configurações carregadas do Firebase');
        }
        if (bookingsSnapshot.exists()) {
            state.bookings = bookingsSnapshot.val();
            console.log('✓ Agendamentos carregados do Firebase');
        }
        if (blockedDaysSnapshot.exists()) {
            state.blockedDays = blockedDaysSnapshot.val();
            console.log('✓ Dias bloqueados carregados do Firebase');
        }
        if (customDayConfigurationsSnapshot.exists()) {
            state.customDayConfigurations = customDayConfigurationsSnapshot.val();
            console.log('✓ Configurações personalizadas carregadas do Firebase');
        }
        if (bookingPasswordSnapshot.exists()) {
            state.bookingPassword = bookingPasswordSnapshot.val();
            console.log('✓ Senha de agendamento carregada do Firebase');
        }
        if (registeredPatientsSnapshot.exists()) {
            state.registeredPatients = registeredPatientsSnapshot.val();
            console.log('✓ Pacientes cadastrados carregados do Firebase');
        }
        if (emailConfigSnapshot.exists()) {
            state.emailConfig = normalizeEmailConfig(emailConfigSnapshot.val());
            console.log('✓ Configuração de email carregada do Firebase');
        }
        if (appearanceConfigSnapshot.exists()) {
            state.appearanceConfig = normalizeAppearanceConfig(appearanceConfigSnapshot.val());
            console.log('✓ Personalização visual carregada do Firebase');
        }

        setupRealtimeListeners(configurationsRef, bookingsRef, blockedDaysRef, customDayConfigurationsRef, bookingPasswordRef, registeredPatientsRef, emailConfigRef, appearanceConfigRef);

        state.isOnline = true;
        state.isInitialized = true;
        console.log('✓ Firebase conectado e sincronizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar com Firebase:', error);
        state.isOnline = false;
        state.isInitialized = true;
        window.dispatchEvent(new CustomEvent('appOffline'));
    }
}

function setupRealtimeListeners(configurationsRef, bookingsRef, blockedDaysRef, customDayConfigurationsRef, bookingPasswordRef, registeredPatientsRef, emailConfigRef, appearanceConfigRef) {
    configurationsRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.configurations = snapshot.val();
            console.log('🔄 Configurações atualizadas em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    bookingsRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.bookings = snapshot.val();
            console.log('🔄 Agendamentos atualizados em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    blockedDaysRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.blockedDays = snapshot.val();
            console.log('🔄 Dias bloqueados atualizados em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    customDayConfigurationsRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.customDayConfigurations = snapshot.val();
            console.log('🔄 Configurações personalizadas atualizadas em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    bookingPasswordRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.bookingPassword = snapshot.val();
            console.log('🔄 Senha de agendamento atualizada em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    registeredPatientsRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.registeredPatients = snapshot.val();
            console.log('🔄 Pacientes cadastrados atualizados em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    emailConfigRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.emailConfig = normalizeEmailConfig(snapshot.val());
            console.log('🔄 Configuração de email atualizada em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });

    appearanceConfigRef.on('value', (snapshot) => {
        if (snapshot.exists() && !state.syncInProgress) {
            state.appearanceConfig = normalizeAppearanceConfig(snapshot.val());
            console.log('🔄 Personalização visual atualizada em tempo real');
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });
}

export async function saveToFirebase() {
    // Wait for Firebase to be ready
    const isReady = await waitForFirebase();
    
    if (!isReady || !isFirebaseAvailable()) {
        console.error('❌ Firebase não disponível');
        window.showFmuNotice('ERRO: Não é possível salvar. Sem conexão com Firebase.', 'Erro de conexão');
        return;
    }

    try {
        state.syncInProgress = true;

        const db = firebaseDB;
        await db.ref('configurations').set(state.configurations);
        await db.ref('bookings').set(state.bookings);
        await db.ref('blockedDays').set(state.blockedDays);
        await db.ref('customDayConfigurations').set(state.customDayConfigurations);
        await db.ref('bookingPassword').set(state.bookingPassword);
        await db.ref('registeredPatients').set(state.registeredPatients);
        await db.ref('emailConfig').set(normalizeEmailConfig(state.emailConfig));
        await db.ref('appearanceConfig').set(normalizeAppearanceConfig(state.appearanceConfig));

        state.isOnline = true;
        console.log('✓ Dados sincronizados com Firebase');
    } catch (error) {
        console.error('❌ Erro ao salvar no Firebase:', error);
        window.showFmuNotice('ERRO: Não foi possível salvar os dados. Verifique sua conexão.', 'Erro de conexão');
        state.isOnline = false;
    } finally {
        state.syncInProgress = false;
    }
}

export function saveState() {
    console.log('💾 Salvando dados no Firebase...');
    if (state.isInitialized) {
        saveToFirebase().catch(err => {
            console.error('❌ Falha ao salvar no Firebase:', err);
            window.showFmuNotice('ERRO: Não foi possível salvar. Verifique sua conexão com a internet.', 'Erro de conexão');
        });
    }
}

export async function loadState() {
    console.log('📂 Carregando dados do Firebase...');
    
    // Wait for Firebase to be ready before loading
    await loadFromFirebase();
}