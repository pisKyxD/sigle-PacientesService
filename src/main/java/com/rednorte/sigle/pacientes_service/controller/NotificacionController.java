package com.rednorte.sigle.pacientes_service.controller;

import com.rednorte.sigle.pacientes_service.model.Notificacion;
import com.rednorte.sigle.pacientes_service.service.NotificacionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService service;

    @GetMapping
    public ResponseEntity<List<Notificacion>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notificacion> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Notificacion>> getByPacienteId(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(service.getByPacienteId(pacienteId));
    }
}
