const amqp = require('amqplib');
const service = require('../services/notificacionService');

const QUEUE = 'sigle.citas.canceladas';

async function startListener() {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await conn.createChannel();
        await channel.assertQueue(QUEUE, { durable: true });
        console.log(`[RabbitMQ] Escuchando cola: ${QUEUE}`);

        channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        try {
            const evento = JSON.parse(msg.content.toString());
            const mensaje = `Estimado paciente, lamentamos informar que su cita ha sido cancelada por el siguiente motivo: ${evento.motivo}. Pronto será reasignado.`;
            await service.create({
            pacienteId: evento.pacienteId,
            tipo: 'CANCELACION_CITA',
            canal: 'EMAIL',
            mensaje,
            estado: 'ENVIADA',
            enviadoEn: new Date(),
            eventoOrigen: 'CitasService.Cancelacion',
            });
            console.log('[RabbitMQ] Notificación guardada.');
            channel.ack(msg);
        } catch (err) {
            console.error('[RabbitMQ] Error:', err.message);
            channel.nack(msg, false, false);
        }
        });

        conn.on('close', () => {
        console.warn('[RabbitMQ] Conexión cerrada. Reintentando en 5s...');
        setTimeout(startListener, 5000);
        });
    } catch (err) {
        console.error('[RabbitMQ] No se pudo conectar:', err.message);
        setTimeout(startListener, 5000);
    }
}

module.exports = { startListener };