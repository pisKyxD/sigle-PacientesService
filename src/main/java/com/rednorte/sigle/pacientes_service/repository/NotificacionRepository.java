package com.rednorte.sigle.pacientes_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rednorte.sigle.pacientes_service.model.Notificacion;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByPacienteId(Long pacienteId);
    List<Notificacion> findByPacienteIdAndLeidoFalse(Long pacienteId);
}