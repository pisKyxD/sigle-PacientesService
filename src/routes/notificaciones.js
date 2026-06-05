const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificacionController');

router.get('/', controller.getAll);
router.get('/paciente/:pacienteId', controller.getByPacienteId);
router.get('/paciente/:pacienteId/no-leidas', controller.getNoLeidas);
router.put('/paciente/:pacienteId/marcar-leidas', controller.marcarLeidas);
router.get('/:id', controller.getById);

module.exports = router;