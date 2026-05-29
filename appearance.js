import { state } from './state.js';

export const DEFAULT_LOGO_SRC = 'COPOM-NOVO (1).png';
export const DEFAULT_BACKGROUND_SRC = 'logo2.png';

function cssUrl(value) {
    return `url("${String(value).replace(/"/g, '\\"')}")`;
}

export function applyAppearanceConfig(config = state.appearanceConfig) {
    const currentConfig = config || {};
    const logoSrc = currentConfig.logoDataUrl || DEFAULT_LOGO_SRC;
    const backgroundSrc = currentConfig.backgroundDataUrl || DEFAULT_BACKGROUND_SRC;

    const logo = document.querySelector('img.logo');
    if (logo && logo.getAttribute('src') !== logoSrc) {
        logo.src = logoSrc;
    }

    document.documentElement.style.setProperty('--app-background-image', cssUrl(backgroundSrc));

    const backgroundPreview = document.getElementById('visualBackgroundPreview');
    if (backgroundPreview) {
        backgroundPreview.style.backgroundImage = cssUrl(backgroundSrc);
    }

    const logoPreview = document.getElementById('visualLogoPreview');
    if (logoPreview && logoPreview.getAttribute('src') !== logoSrc) {
        logoPreview.src = logoSrc;
    }
}
