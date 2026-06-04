const Notificacion = require('../models/Notificacion');

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

const create = async (data) => {
    return await Notificacion.create({
        ...data,
        creadoEn: new Date(),
        estado: data.estado || 'PENDIENTE',
        intentos: data.intentos ?? 0,
    });
};

module.exports = { getAll, getById, getByPacienteId, create };