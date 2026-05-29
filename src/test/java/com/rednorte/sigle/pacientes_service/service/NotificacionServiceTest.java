package com.rednorte.sigle.pacientes_service.service;

import com.rednorte.sigle.pacientes_service.model.Notificacion;
import com.rednorte.sigle.pacientes_service.repository.NotificacionRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificacionServiceTest {

    @Test
    void deberiaObtenerTodasLasNotificaciones() {
        NotificacionRepository repo = mock(NotificacionRepository.class);
        NotificacionService service = new NotificacionService(repo);

        when(repo.findAll()).thenReturn(List.of(new Notificacion()));

        List<Notificacion> result = service.getAll();
        assertEquals(1, result.size());
    }

    @Test
    void deberiaObtenerPorId() {
        NotificacionRepository repo = mock(NotificacionRepository.class);
        NotificacionService service = new NotificacionService(repo);

        Notificacion notif = new Notificacion();
        notif.setId(1L);

        when(repo.findById(1L)).thenReturn(Optional.of(notif));

        Notificacion result = service.getById(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void deberiaMarcarTodasComoLeidas() {
        NotificacionRepository repo = mock(NotificacionRepository.class);
        NotificacionService service = new NotificacionService(repo);

        Notificacion notif = new Notificacion();
        notif.setLeido(false);

        when(repo.findByPacienteIdAndLeidoFalse(10L)).thenReturn(List.of(notif));

        service.marcarTodasComoLeidas(10L);

        assertTrue(notif.getLeido());
        verify(repo).saveAll(anyList());
    }
}
