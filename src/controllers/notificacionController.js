const service = require('../services/notificacionService');

const getAll = async (req, res, next) => {
  try {
    res.json(await service.getAll());
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    res.json(await service.getById(req.params.id));
  } catch (err) { next(err); }
};

const getByPacienteId = async (req, res, next) => {
  try {
    res.json(await service.getByPacienteId(req.params.pacienteId));
  } catch (err) { next(err); }
};

const getNoLeidas = async (req, res, next) => {
    try {
        res.json(await service.getNoLeidasByPacienteId(req.params.pacienteId));
    } catch (err) { next(err); }
};

const marcarLeidas = async (req, res, next) => {
    try {
        await service.marcarTodasComoLeidas(req.params.pacienteId);
        res.status(200).json({ message: 'Notificaciones marcadas como leídas' });
    } catch (err) { next(err); }
};

module.exports = { getAll, getById, getByPacienteId, getNoLeidas, marcarLeidas };