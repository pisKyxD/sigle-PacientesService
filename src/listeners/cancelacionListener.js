const amqp = require('amqplib');
const service = require('../services/notificacionService');

const EXCHANGE = 'sigle.exchange';
const ROUTING_KEY = 'citas.cancelada';
const QUEUE = 'sigle.citas.canceladas';

async function startListener() {

    try {

        const conn = await amqp.connect(process.env.RABBITMQ_URL);

        const channel = await conn.createChannel();

        await channel.assertExchange(EXCHANGE, 'direct', {
            durable: true
        });

        await channel.assertQueue(QUEUE, {
            durable: true
        });

        await channel.bindQueue(
            QUEUE,
            EXCHANGE,
            ROUTING_KEY
        );

        console.log(`[RabbitMQ] Escuchando cola: ${QUEUE}`);

        channel.consume(QUEUE, async (msg) => {

            console.log("========== CANCELACIÓN RECIBIDA ==========");

            if (!msg) return;

            console.log(msg.content.toString());

            try {

                const evento = JSON.parse(msg.content.toString());

                const mensaje =
                    `Estimado paciente, lamentamos informar que su cita ha sido cancelada por el siguiente motivo: ${evento.motivo}. Pronto será reasignado.`;

                await service.create({
                    pacienteId: evento.pacienteId,
                    tipo: 'CANCELACION_CITA',
                    canal: 'EMAIL',
                    mensaje,
                    eventoOrigen: 'CitasService.Cancelacion',
                });

                console.log("[RabbitMQ] Notificación de cancelación creada.");

                channel.ack(msg);

            } catch (err) {

                console.error("[RabbitMQ] Error:", err);

                channel.nack(msg, false, false);

            }

        });

        conn.on('close', () => {
            console.warn("[RabbitMQ] Conexión cerrada.");
            setTimeout(startListener, 5000);
        });

    } catch (err) {

        console.error("[RabbitMQ] Error:", err);

        setTimeout(startListener, 5000);

    }

}

module.exports = {
    startListener
};