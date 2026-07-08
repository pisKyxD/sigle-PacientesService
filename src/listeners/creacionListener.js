const amqp = require('amqplib');
const service = require('../services/notificacionService');

const EXCHANGE = 'sigle.exchange';
const ROUTING_KEY = 'citas.creada';
const QUEUE = 'sigle.citas.creadas';

function formatearFecha(fechaHora) {
    if (!fechaHora) return '';

    const d = new Date(fechaHora);

    return d.toLocaleString('es-CL', {
        dateStyle: 'long',
        timeStyle: 'short'
    });
}

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

            console.log("========== MENSAJE RECIBIDO ==========");

            if (!msg) return;

            console.log(msg.content.toString());

            try {

                const evento = JSON.parse(msg.content.toString());

                console.log("Evento:", evento);

                const fecha = formatearFecha(evento.fechaHora);

                const medico = evento.medicoNombre
                    ? ` con el Dr(a). ${evento.medicoNombre}`
                    : '';

                const mensaje =
                    `Estimado paciente, su cita de ${evento.especialidad || 'atención médica'}${medico} ha sido agendada exitosamente para el ${fecha}.`;

                await service.create({
                    pacienteId: evento.pacienteId,
                    tipo: 'CREACION_CITA',
                    canal: 'EMAIL',
                    mensaje,
                    eventoOrigen: 'CitasService.Creacion',
                });

                console.log("[RabbitMQ] Notificación creada correctamente.");

                channel.ack(msg);

            } catch (err) {

                console.error("[RabbitMQ] Error:", err);

                channel.nack(msg, false, false);
            }

        });

        conn.on('close', () => {
            console.warn("[RabbitMQ] Conexión cerrada. Reintentando...");
            setTimeout(startListener, 5000);
        });

    } catch (err) {

        console.error("[RabbitMQ] Error de conexión:", err);

        setTimeout(startListener, 5000);

    }
}

module.exports = {
    startListener
};