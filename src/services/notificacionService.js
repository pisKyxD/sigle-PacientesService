const Notificacion = require('../models/Notificacion');
const listasClient = require('./listasClient');
const emailService = require('./emailService');

const ASUNTOS_POR_TIPO = {
    CANCELACION_CITA: 'Tu cita médica ha sido cancelada',
    CREACION_CITA: 'Confirmación de tu cita médica',
};

const getAll = async () => await Notificacion.findAll();

const getById = async (id) => {
    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
        const error = new Error('Notificación no encontrada');
        error.status = 404;
        throw error;
    }
    return notificacion;
};

const getByPacienteId = async (pacienteId) => {
    return await Notificacion.findAll({ where: { pacienteId } });
};

const getNoLeidasByPacienteId = async (pacienteId) => {
    return await Notificacion.findAll({ where: { pacienteId, leido: false } });
};

const marcarTodasComoLeidas = async (pacienteId) => {
    await Notificacion.update({ leido: true }, { where: { pacienteId, leido: false } });
};

const create = async (data) => {
    const notificacion = await Notificacion.create({
        ...data,
        creadoEn: new Date(),
        estado: 'PENDIENTE',
        intentos: 0,
        leido: false,
    });

    if (data.canal === 'EMAIL') {
        let enviado = false;
        try {
            const paciente = await listasClient.getPacienteById(data.pacienteId);
            if (paciente?.email) {
                enviado = await emailService.enviarCorreo({
                    destinatario: paciente.email,
                    asunto: ASUNTOS_POR_TIPO[data.tipo] || 'Notificación SIGLE RedNorte',
                    mensaje: data.mensaje,
                });
            } else {
                console.warn(`[Notificacion] Paciente ${data.pacienteId} sin email registrado, no se envía correo.`);
            }
        } catch (err) {
            console.error('[Notificacion] Error al intentar enviar el correo:', err.message);
        }

        await notificacion.update({
            estado: enviado ? 'ENVIADA' : 'FALLIDA',
            intentos: 1,
            enviadoEn: enviado ? new Date() : null,
        });
    } else {
        await notificacion.update({
            estado: data.estado || 'ENVIADA',
            enviadoEn: data.enviadoEn || new Date(),
        });
    }

    return notificacion;
};

module.exports = { getAll, getById, getByPacienteId, getNoLeidasByPacienteId, marcarTodasComoLeidas, create };