const { getTransporter } = require('../config/mailer');

const FROM_NAME = process.env.MAIL_FROM_NAME || 'SIGLE RedNorte';

const enviarCorreo = async ({ destinatario, asunto, mensaje }) => {

    if (!destinatario) {
        console.warn('[Email] No hay destinatario, no se envía correo.');
        return false;
    }

    console.log("[Email] Entró a enviarCorreo()");

    const transporter = getTransporter();

    if (!transporter) {
        console.error("[Email] Transporter es null");
        return false;
    }

    try {

        console.log("[Email] Antes de verify()");

        await transporter.verify();

        console.log("[Email] Después de verify()");

        console.log("[Email] Antes de sendMail()");

        await transporter.sendMail({
            from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            text: mensaje,
            html: `<p>${mensaje.replace(/\n/g, '<br/>')}</p>`,
        });

        console.log("[Email] Después de sendMail()");
        console.log(`[Email] Correo enviado a ${destinatario}`);

        return true;

    } catch (err) {

        console.error("========== ERROR SMTP ==========");
        console.error(err);
        console.error("Código:", err.code);
        console.error("Comando:", err.command);
        console.error("Respuesta:", err.response);
        console.error("Stack:", err.stack);
        console.error("================================");

        return false;
    }
};

module.exports = { enviarCorreo };