const { getTransporter } = require('../config/mailer');

const FROM_NAME = process.env.MAIL_FROM_NAME || 'SIGLE RedNorte';

const enviarCorreo = async ({ destinatario, asunto, mensaje }) => {
  if (!destinatario) {
    console.warn('[Email] No hay destinatario, no se envía correo.');
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      text: mensaje,
      html: `<p>${mensaje.replace(/\n/g, '<br/>')}</p>`,
    });
    console.log(`[Email] Correo enviado a ${destinatario}`);
    return true;
  } catch (err) {
    console.error('[Email] Error al enviar correo:', err.message);
    return false;
  }
};

module.exports = { enviarCorreo };