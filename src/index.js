require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const notificacionesRouter = require('./routes/notificaciones');
const { startListener } = require('./listeners/cancelacionListener');

const app = express();
const PORT = process.env.PORT || 8083;

app.use(express.json());
app.use('/api/pacientes/notificaciones', notificacionesRouter);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'pacientes-service' }));

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

sequelize.sync({ alter: true })
  .then(() => {
    console.log('[DB] Conectado y sincronizado.');
    startListener();
    app.listen(PORT, () => console.log(`[Server] pacientes-service corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('[DB] Error:', err.message);
    process.exit(1);
  });