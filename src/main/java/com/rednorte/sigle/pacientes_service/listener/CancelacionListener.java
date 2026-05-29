package com.rednorte.sigle.pacientes_service.listener;

import com.rednorte.sigle.pacientes_service.model.Notificacion;
import com.rednorte.sigle.pacientes_service.repository.NotificacionRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CancelacionListener {

    private final NotificacionRepository notificacionRepository;

    @RabbitListener(queues = "sigle.citas.canceladas")
    public void recibirCancelacion(CancelacionEvento evento) {
        log.info("Evento de cancelación recibido para la cita {} del paciente {}",
                evento.getCitaId(), evento.getPacienteId());

        String mensaje = String.format(
            "Estimado paciente, lamentamos informar que su cita ha sido cancelada por el siguiente motivo: %s. Pronto será reasignado.",
            evento.getMotivo()
        );

        Notificacion notificacion = Notificacion.builder()
                .pacienteId(evento.getPacienteId())
                .tipo("CANCELACION_CITA")
                .canal("EMAIL")
                .mensaje(mensaje)
                .estado("ENVIADA")
                .enviadoEn(LocalDateTime.now())
                .eventoOrigen("CitasService.Cancelacion")
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación guardada/enviada con éxito.");
    }

    @Data
    public static class CancelacionEvento {
        private Long citaId;
        private Long pacienteId;
        private Long listaEsperaId;
        private String motivo;
    }
}

