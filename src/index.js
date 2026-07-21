require('dotenv').config();
const sequelize = require('./config/database');
const { startListener } = require('./listeners/cancelacionListener');
const { startListener: startCreacionListener } = require('./listeners/creacionListener');
const { startListener: startOfertaListener } = require('./listeners/ofertaListener');
const app = require('./app');
const eurekaClient = require('./config/eureka');

const PORT = process.env.PORT || 8083;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('[DB] Conectado y sincronizado.');
    startListener();
    startCreacionListener();
    startOfertaListener();
    app.listen(PORT, () => {
      console.log(`[Server] pacientes-service corriendo en puerto ${PORT}`);
      eurekaClient.start((error) => {
        if (error) {
          console.error('[Eureka] Error al registrar:', error);
        } else {
          console.log('[Eureka] pacientes-service registrado correctamente');
        }
      });
    });
  })
  .catch((err) => {
    console.error('[DB] Error:', err.message);
    process.exit(1);
  });

process.on('SIGINT', () => {
  eurekaClient.stop(() => {
    console.log('[Eureka] Desregistrado');
    process.exit(0);
  });
});