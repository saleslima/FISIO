(function () {
    function createNoticeModal() {
        let overlay = document.getElementById('fmuNoticeModal');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'fmuNoticeModal';
        overlay.className = 'fmu-notice-overlay';
        overlay.setAttribute('aria-hidden', 'true');

        overlay.innerHTML = `
            <div class="fmu-notice-card" role="alertdialog" aria-modal="true" aria-labelledby="fmuNoticeTitle" aria-describedby="fmuNoticeMessage">
                <button class="fmu-notice-close" type="button" aria-label="Fechar aviso">&times;</button>
                <div class="fmu-notice-icon" aria-hidden="true">!</div>
                <h2 id="fmuNoticeTitle">Aviso</h2>
                <p id="fmuNoticeMessage"></p>
                <button id="fmuNoticeOkBtn" class="btn-primary" type="button">Entendi</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeNotice = () => {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        };

        overlay.querySelector('.fmu-notice-close').addEventListener('click', closeNotice);
        overlay.querySelector('#fmuNoticeOkBtn').addEventListener('click', closeNotice);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeNotice();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && overlay.classList.contains('active')) closeNotice();
        });

        return overlay;
    }

    window.showFmuNotice = function showFmuNotice(message, title = 'Aviso') {
        const overlay = createNoticeModal();
        const titleElement = overlay.querySelector('#fmuNoticeTitle');
        const messageElement = overlay.querySelector('#fmuNoticeMessage');
        const okButton = overlay.querySelector('#fmuNoticeOkBtn');

        titleElement.textContent = title;
        messageElement.textContent = message;

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        setTimeout(() => okButton.focus(), 50);
    };
})();
