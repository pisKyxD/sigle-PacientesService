const Notificacion = require('../models/Notificacion');
const listasClient = require('./listasClient');
const emailService = require('./emailService');

const ASUNTOS_POR_TIPO = {
    CANCELACION_CITA: 'Tu cita médica ha sido cancelada',
    CREACION_CITA: 'Confirmación de tu cita médica',
    OFERTA_CUPO: 'Se liberó un cupo médico para ti',
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
    return await Notificacion.findAll({
        where: { pacienteId }
    });
};

const getNoLeidasByPacienteId = async (pacienteId) => {
    return await Notificacion.findAll({
        where: {
            pacienteId,
            leido: false
        }
    });
};

const marcarTodasComoLeidas = async (pacienteId) => {
    await Notificacion.update(
        { leido: true },
        {
            where: {
                pacienteId,
                leido: false
            }
        }
    );
};

const create = async (data) => {

    console.log("========================================");
    console.log("[NOTIFICACION] Entró al create()");
    console.log(data);
    console.log("========================================");

    const notificacion = await Notificacion.create({
        ...data,
        creadoEn: new Date(),
        estado: 'PENDIENTE',
        intentos: 0,
        leido: false,
    });

    console.log("[NOTIFICACION] Registro guardado en BD.");

    if (data.canal === 'EMAIL') {

        let enviado = false;

        try {

            console.log("[NOTIFICACION] Buscando paciente:", data.pacienteId);

            const paciente = await listasClient.getPacienteById(data.pacienteId);

            console.log("[NOTIFICACION] Paciente encontrado:");
            console.log(paciente);

            if (paciente?.email) {

                console.log("[NOTIFICACION] Email destino:", paciente.email);

                console.log("[NOTIFICACION] >>> Antes de llamar a emailService");

                enviado = await emailService.enviarCorreo({
                    destinatario: paciente.email,
                    asunto: ASUNTOS_POR_TIPO[data.tipo] || 'Notificación SIGLE RedNorte',
                    mensaje: data.mensaje,
                });

                console.log("[NOTIFICACION] >>> Después de llamar a emailService");

                console.log("[NOTIFICACION] Resultado envío:", enviado);

            } else {

                console.warn(`[NOTIFICACION] Paciente ${data.pacienteId} sin email.`);

            }

        } catch (err) {

            console.error("[NOTIFICACION] Error enviando correo:");
            console.error(err);

        }

        await notificacion.update({
            estado: enviado ? 'ENVIADA' : 'FALLIDA',
            intentos: 1,
            enviadoEn: enviado ? new Date() : null,
        });

        console.log("[NOTIFICACION] Estado actualizado:", enviado ? "ENVIADA" : "FALLIDA");

    } else {

        await notificacion.update({
            estado: data.estado || 'ENVIADA',
            enviadoEn: data.enviadoEn || new Date(),
        });

    }

    return notificacion;
};

module.exports = {
    getAll,
    getById,
    getByPacienteId,
    getNoLeidasByPacienteId,
    marcarTodasComoLeidas,
    create
};