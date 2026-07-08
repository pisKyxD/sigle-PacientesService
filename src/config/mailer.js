const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[Mailer] Variables de Gmail no configuradas.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
      user,
      pass,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,

    tls: {
      rejectUnauthorized: false,
    },

    logger: true,
    debug: true,
  });

  return transporter;
}

module.exports = { getTransporter };