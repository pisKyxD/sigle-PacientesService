const express = require('express');
const router = express.Router();
const service = require('../services/notificacionService');

// GET /api/pacientes/notificaciones
router.get('/', async (req, res, next) => {
    try {
        res.json(await service.getAll());
    } catch (err) { next(err); }
});

// GET /api/pacientes/notificaciones/:id
router.get('/:id', async (req, res, next) => {
    try {
        res.json(await service.getById(req.params.id));
    } catch (err) { next(err); }
});

// GET /api/pacientes/notificaciones/paciente/:pacienteId
router.get('/paciente/:pacienteId', async (req, res, next) => {
    try {
        res.json(await service.getByPacienteId(req.params.pacienteId));
    } catch (err) { next(err); }
});

module.exports = router;