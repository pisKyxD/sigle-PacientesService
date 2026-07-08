const amqp = require('amqplib');
const service = require('../services/notificacionService');

const QUEUE = 'sigle.citas.creadas';

function formatearFecha(fechaHora) {
    if (!fechaHora) return '';
    const d = new Date(fechaHora);
    return d.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });
}

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
                const fecha = formatearFecha(evento.fechaHora);
                const medico = evento.medicoNombre ? ` con el Dr(a). ${evento.medicoNombre}` : '';
                const mensaje = `Estimado paciente, su cita de ${evento.especialidad || 'atención médica'}${medico} ha sido agendada exitosamente para el ${fecha}.`;

                await service.create({
                    pacienteId: evento.pacienteId,
                    tipo: 'CREACION_CITA',
                    canal: 'EMAIL',
                    mensaje,
                    eventoOrigen: 'CitasService.Creacion',
                });
                console.log('[RabbitMQ] Notificación de cita creada guardada.');
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