const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificacionController');

router.get('/', controller.getAll);
router.get('/paciente/:pacienteId', controller.getByPacienteId);
router.get('/:id', controller.getById);

module.exports = router;