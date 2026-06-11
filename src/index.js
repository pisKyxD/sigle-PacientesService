require('dotenv').config();
const sequelize = require('./config/database');
const { startListener } = require('./listeners/cancelacionListener');
const app = require('./app');

const PORT = process.env.PORT || 8083;

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