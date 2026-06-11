const express = require('express');
const notificacionesRouter = require('./routes/notificaciones');

const app = express();

app.use(express.json());
app.use('/api/pacientes/notificaciones', notificacionesRouter);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'pacientes-service' }));

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;