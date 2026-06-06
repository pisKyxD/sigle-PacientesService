const service = require('../services/notificacionService');

const validarPacienteId = (pacienteId) => {
    const id = parseInt(pacienteId);
    if (isNaN(id) || id <= 0) {
        const error = new Error('El pacienteId debe ser un número válido');
        error.status = 400;
        throw error;
    }
    return id;
};

const getAll = async (req, res, next) => {
    try {
        res.json(await service.getAll());
    } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'El id debe ser un número válido' });
        }
        res.json(await service.getById(id));
    } catch (err) { next(err); }
};

const getByPacienteId = async (req, res, next) => {
    try {
        const id = validarPacienteId(req.params.pacienteId);
        res.json(await service.getByPacienteId(id));
    } catch (err) { next(err); }
};

const getNoLeidas = async (req, res, next) => {
    try {
        const id = validarPacienteId(req.params.pacienteId);
        res.json(await service.getNoLeidasByPacienteId(id));
    } catch (err) { next(err); }
};

const marcarLeidas = async (req, res, next) => {
    try {
        const id = validarPacienteId(req.params.pacienteId);
        await service.marcarTodasComoLeidas(id);
        res.status(200).json({ message: 'Notificaciones marcadas como leídas' });
    } catch (err) { next(err); }
};

module.exports = { getAll, getById, getByPacienteId, getNoLeidas, marcarLeidas };