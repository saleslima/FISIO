// Modal management module
import { state, saveState } from './state.js';
import { renderBlockedCalendar, renderCalendar } from './calendar.js';
import { renderCustomizeCalendar } from './admin.js';

export function initializeModals() {
    initializeBookingModal();
    initializeReportModal();
    initializeBlockedDaysModal();
    initializeCancellationModal();
    initializeCustomizeDayModal();
    initializeCustomizeDayFormModal();
    initializeSearchBookingsModal();
    initializeConfirmationModal();
}

function initializeBookingModal() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function initializeReportModal() {
    const reportModal = document.getElementById('reportModal');
    const closeReport = document.getElementById('closeReport');

    closeReport.addEventListener('click', () => {
        reportModal.classList.remove('active');
    });

    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.remove('active');
        }
    });
}

function initializeBlockedDaysModal() {
    const blockedDaysModal = document.getElementById('blockedDaysModal');
    const closeBlockedDays = document.getElementById('closeBlockedDays');

    closeBlockedDays.addEventListener('click', () => {
        blockedDaysModal.classList.remove('active');
    });

    blockedDaysModal.addEventListener('click', (e) => {
        if (e.target === blockedDaysModal) {
            blockedDaysModal.classList.remove('active');
        }
    });

    const prevMonthBlocked = document.getElementById('prevMonthBlocked');
    const nextMonthBlocked = document.getElementById('nextMonthBlocked');

    if (prevMonthBlocked && nextMonthBlocked) {
        prevMonthBlocked.addEventListener('click', () => {
            state.blockedCalendarMonth--;
            if (state.blockedCalendarMonth < 0) {
                state.blockedCalendarMonth = 11;
                state.blockedCalendarYear--;
            }
            renderBlockedCalendar();
        });

        nextMonthBlocked.addEventListener('click', () => {
            state.blockedCalendarMonth++;
            if (state.blockedCalendarMonth > 11) {
                state.blockedCalendarMonth = 0;
                state.blockedCalendarYear++;
            }
            renderBlockedCalendar();
        });
    }
}

function initializeCancellationModal() {
    const modal = document.getElementById('cancellationModal');
    const closeBtn = document.getElementById('closeCancellation');
    const passwordInput = document.getElementById('cancelPassword');
    const reasonInput = document.getElementById('cancelReason');
    const requestedByInput = document.getElementById('cancelRequestedBy');
    const confirmBtn = document.getElementById('confirmCancelBtn');
    const cancelBtn = document.getElementById('cancelCancelBtn');

    const validateForm = () => {
        const password = passwordInput.value;
        const reason = reasonInput.value.trim();
        const requestedBy = requestedByInput.value.trim();

        confirmBtn.disabled = !(password === 'daqta' && reason.length >= 10 && requestedBy.length > 0);
    };

    passwordInput.addEventListener('input', validateForm);

    reasonInput.addEventListener('input', () => {
        reasonInput.value = reasonInput.value.toUpperCase();
        validateForm();
    });

    requestedByInput.addEventListener('input', () => {
        requestedByInput.value = requestedByInput.value.toUpperCase();
        validateForm();
    });

    confirmBtn.addEventListener('click', () => {
        const dateKey = modal.dataset.dateKey;
        const bookingIndex = parseInt(modal.dataset.bookingIndex);
        const reason = reasonInput.value.trim();
        const requestedBy = requestedByInput.value.trim();

        if (state.bookings[dateKey] && state.bookings[dateKey][bookingIndex]) {
            state.bookings[dateKey][bookingIndex].cancellation = {
                reason,
                requestedBy,
                timestamp: new Date().toISOString()
            };
            saveState();
            renderCalendar();
            modal.classList.remove('active');
            window.dispatchEvent(new CustomEvent('showReport'));
            alert('Reserva cancelada com sucesso!');
        }
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function initializeCustomizeDayModal() {
    const customizeDayModal = document.getElementById('customizeDayModal');
    const closeCustomizeDay = document.getElementById('closeCustomizeDay');

    closeCustomizeDay.addEventListener('click', () => {
        customizeDayModal.classList.remove('active');
    });

    customizeDayModal.addEventListener('click', (e) => {
        if (e.target === customizeDayModal) {
            customizeDayModal.classList.remove('active');
        }
    });

    const prevMonthCustomize = document.getElementById('prevMonthCustomize');
    const nextMonthCustomize = document.getElementById('nextMonthCustomize');

    if (prevMonthCustomize && nextMonthCustomize) {
        prevMonthCustomize.addEventListener('click', () => {
            state.customizeCalendarMonth--;
            if (state.customizeCalendarMonth < 0) {
                state.customizeCalendarMonth = 11;
                state.customizeCalendarYear--;
            }
            renderCustomizeCalendar();
        });

        nextMonthCustomize.addEventListener('click', () => {
            state.customizeCalendarMonth++;
            if (state.customizeCalendarMonth > 11) {
                state.customizeCalendarMonth = 0;
                state.customizeCalendarYear++;
            }
            renderCustomizeCalendar();
        });
    }
}

function initializeCustomizeDayFormModal() {
    const modal = document.getElementById('customizeDayFormModal');
    const closeBtn = document.getElementById('closeCustomizeDayForm');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function initializeSearchBookingsModal() {
    const modal = document.getElementById('searchBookingsModal');
    const closeBtn = document.getElementById('closeSearchBookings');
    const searchBtn = document.getElementById('searchBtn');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    searchBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('performSearchBookings'));
    });
    
    // Allow Enter key to search
    document.getElementById('searchCpf').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.dispatchEvent(new CustomEvent('performSearchBookings'));
        }
    });
}

function initializeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    const closeBtn = document.getElementById('closeConfirmation');
    const closeBtnMain = document.getElementById('closeConfirmationBtn');
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    const shareEmail = document.getElementById('shareEmail');
    const downloadPDF = document.getElementById('downloadPDF');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    closeBtnMain.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    shareWhatsApp.addEventListener('click', () => {
        const bookingInfo = JSON.parse(modal.dataset.bookingInfo);
        const message = `🏥 *COMPROVANTE DE AGENDAMENTO - FISIOTERAPIA*\n\n` +
                       `📅 *Data:* ${bookingInfo.date}\n` +
                       `⏰ *Período:* ${bookingInfo.period}\n` +
                       `🕐 *Horário:* ${bookingInfo.time}\n` +
                       `👤 *Paciente:* ${bookingInfo.name}\n` +
                       `📱 *WhatsApp:* ${bookingInfo.phone}\n` +
                       `📋 *CPF:* ${bookingInfo.cpf}\n` +
                       `✅ *Confirmado em:* ${bookingInfo.timestamp}`;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    });
    
    shareEmail.addEventListener('click', () => {
        const bookingInfo = JSON.parse(modal.dataset.bookingInfo);
        const subject = 'Comprovante de Agendamento - Fisioterapia';
        const body = `COMPROVANTE DE AGENDAMENTO - FISIOTERAPIA\n\n` +
                    `Data: ${bookingInfo.date}\n` +
                    `Período: ${bookingInfo.period}\n` +
                    `Horário: ${bookingInfo.time}\n` +
                    `Paciente: ${bookingInfo.name}\n` +
                    `WhatsApp: ${bookingInfo.phone}\n` +
                    `CPF: ${bookingInfo.cpf}\n` +
                    `Confirmado em: ${bookingInfo.timestamp}`;
        
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    });
    
    downloadPDF.addEventListener('click', () => {
        const bookingInfo = JSON.parse(modal.dataset.bookingInfo);
        generateBookingPDF(bookingInfo);
    });
}

function generateBookingPDF(bookingInfo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('COMPROVANTE DE AGENDAMENTO', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Fisioterapia', 105, 40, { align: 'center' });
    
    // Booking details box
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(20, 55, 170, 90);
    
    let yPos = 70;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    doc.text('Data:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.date, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Período:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.period, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Horário:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.time, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Paciente:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.name, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('CPF:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.cpf, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('WhatsApp:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.phone, 80, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Confirmado em:', 30, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bookingInfo.timestamp, 80, yPos);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(128);
    doc.text('Guarde este comprovante para apresentar no dia do atendimento.', 105, 160, { align: 'center' });
    
    // Save
    doc.save(`comprovante_agendamento_${bookingInfo.date.replace(/\s/g, '_')}.pdf`);
}

export function showCancellationModal(dateKey, bookingIndex) {
    const modal = document.getElementById('cancellationModal');
    modal.dataset.dateKey = dateKey;
    modal.dataset.bookingIndex = bookingIndex;
    modal.classList.add('active');

    document.getElementById('cancelPassword').value = '';
    document.getElementById('cancelReason').value = '';
    document.getElementById('cancelRequestedBy').value = '';
    document.getElementById('confirmCancelBtn').disabled = true;
}