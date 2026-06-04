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

module.exports = { getAll, getById, getByPacienteId };