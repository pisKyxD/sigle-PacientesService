package com.rednorte.sigle.pacientes_service.service;

import com.rednorte.sigle.pacientes_service.model.Notificacion;
import com.rednorte.sigle.pacientes_service.repository.NotificacionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository repository;

    public List<Notificacion> getAll() {
        return repository.findAll();
    }

    public Notificacion getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
    }

    public List<Notificacion> getByPacienteId(Long pacienteId) {
        return repository.findByPacienteId(pacienteId);
    }

    public List<Notificacion> getNoLeidasByPacienteId(Long pacienteId) {
        return repository.findByPacienteIdAndLeidoFalse(pacienteId);
    }

    public void marcarTodasComoLeidas(Long pacienteId) {
        List<Notificacion> notificaciones = repository.findByPacienteIdAndLeidoFalse(pacienteId);
        notificaciones.forEach(n -> n.setLeido(true));
        repository.saveAll(notificaciones);
    }
}