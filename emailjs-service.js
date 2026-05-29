// EmailJS integration for static hosting (HTML/CSS/JS only).
// No SMTP password is stored or used in the browser.
import { state } from './state.js';

function getEmailConfig() {
    const config = state.emailConfig || {};
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

function isConfigured(config) {
    return Boolean(config.publicKey && config.serviceId && config.templateId);
}

function buildMessage(bookingInfo, config) {
    return [
        'COMPROVANTE DE AGENDAMENTO - FISIOTERAPIA',
        '',
        `Aplicativo: ${config.fromName || 'FMU'}`,
        `Tipo: ${bookingInfo.type}`,
        `Data: ${bookingInfo.date}`,
        `Período: ${bookingInfo.period}`,
        `Horário: ${bookingInfo.time}`,
        `Paciente: ${bookingInfo.name}`,
        `${bookingInfo.docLabel}: ${bookingInfo.doc}`,
        `Email: ${bookingInfo.email}`,
        `WhatsApp: ${bookingInfo.phone}`,
        bookingInfo.rank ? `Graduação: ${bookingInfo.rank}` : null,
        bookingInfo.unit ? `Unidade: ${bookingInfo.unit === 'copom' ? 'COPOM' : 'Outros'}` : null,
        `Queixa: ${bookingInfo.complaint}`,
        `Confirmado em: ${bookingInfo.timestamp}`
    ].filter(Boolean).join('\n');
}

function buildTemplateParams(bookingInfo, config) {
    return {
        app_name: config.fromName || 'FMU',
        from_name: config.fromName || 'FMU',
        to_email: bookingInfo.email,
        patient_email: bookingInfo.email,
        reply_to: config.replyTo || config.adminEmail || bookingInfo.email,
        admin_email: config.adminEmail || '',
        subject: 'Comprovante de Agendamento - Fisioterapia',
        patient_name: bookingInfo.name,
        patient_type: bookingInfo.type,
        patient_doc_label: bookingInfo.docLabel,
        patient_doc: bookingInfo.doc,
        patient_phone: bookingInfo.phone,
        appointment_date: bookingInfo.date,
        appointment_period: bookingInfo.period,
        appointment_time: bookingInfo.time,
        complaint: bookingInfo.complaint,
        rank: bookingInfo.rank || '',
        unit: bookingInfo.unit ? (bookingInfo.unit === 'copom' ? 'COPOM' : 'Outros') : '',
        confirmed_at: bookingInfo.timestamp,
        message: buildMessage(bookingInfo, config)
    };
}

export async function sendBookingConfirmationEmail(bookingInfo) {
    const config = getEmailConfig();

    if (!config.autoSend) {
        return {
            ok: false,
            skipped: true,
            reason: 'Envio automático de e-mail desativado nas configurações.'
        };
    }

    if (!isConfigured(config)) {
        return {
            ok: false,
            skipped: true,
            reason: 'E-mail automático ainda não configurado. Acesse Administrador > Configurar Email e informe os dados do EmailJS.'
        };
    }

    if (!window.emailjs || typeof window.emailjs.send !== 'function') {
        return {
            ok: false,
            reason: 'A biblioteca EmailJS não carregou. Verifique a conexão com a internet e tente novamente.'
        };
    }

    try {
        window.emailjs.init({ publicKey: config.publicKey });
        await window.emailjs.send(config.serviceId, config.templateId, buildTemplateParams(bookingInfo, config));
        return { ok: true };
    } catch (error) {
        console.error('Erro ao enviar e-mail pelo EmailJS:', error);
        return {
            ok: false,
            reason: error?.text || error?.message || 'Falha ao enviar e-mail automático pelo EmailJS.'
        };
    }
}
