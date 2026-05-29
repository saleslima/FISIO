(() => {
    const PROMPT_DURATION_MS = 5000;
    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    let deferredPrompt = null;
    let hideTimer = null;

    function getElements() {
        return {
            prompt: document.getElementById('pwaInstallPrompt'),
            installButton: document.getElementById('pwaInstallButton')
        };
    }

    function hideInstallArrow() {
        const { prompt } = getElements();
        if (!prompt) return;
        prompt.classList.remove('is-visible');
        window.setTimeout(() => {
            if (!prompt.classList.contains('is-visible')) prompt.hidden = true;
        }, 250);
    }

    function showInstallArrow() {
        if (isStandalone()) return;
        const { prompt } = getElements();
        if (!prompt) return;

        window.clearTimeout(hideTimer);
        prompt.hidden = false;
        window.requestAnimationFrame(() => prompt.classList.add('is-visible'));
        hideTimer = window.setTimeout(hideInstallArrow, PROMPT_DURATION_MS);
    }

    async function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        try {
            await navigator.serviceWorker.register('service-worker.js');
        } catch (error) {
            console.warn('Service worker não registrado:', error);
        }
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        showInstallArrow();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallArrow();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const { installButton, prompt } = getElements();

        if (prompt) {
            prompt.addEventListener('mouseenter', () => window.clearTimeout(hideTimer));
            prompt.addEventListener('mouseleave', () => {
                hideTimer = window.setTimeout(hideInstallArrow, 1800);
            });
        }

        if (installButton) {
            installButton.addEventListener('click', async () => {
                window.clearTimeout(hideTimer);

                if (!deferredPrompt) {
                    window.showFmuNotice('Para instalar o FMU, use o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”. Em alguns celulares, use Compartilhar > Adicionar à Tela de Início.', 'Instalação');
                    hideInstallArrow();
                    return;
                }

                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                deferredPrompt = null;
                hideInstallArrow();
            });
        }

        registerServiceWorker();

        window.setTimeout(() => {
            if (!isStandalone()) showInstallArrow();
        }, 900);
    });
})();
