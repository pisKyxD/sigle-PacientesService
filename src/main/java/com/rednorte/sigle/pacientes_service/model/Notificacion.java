package com.rednorte.sigle.pacientes_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paciente_id")
    private Long pacienteId;
    
    private String tipo;
    private String canal;
    private String mensaje;
    private String estado;
    private Integer intentos;
    
    @Column(name = "enviado_en")
    private LocalDateTime enviadoEn;
    
    @Column(name = "evento_origen")
    private String eventoOrigen;
    
    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @Column(name = "leido")
    @Builder.Default
    private Boolean leido = false;
    
    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
        if (intentos == null) intentos = 0;
        if (estado == null) estado = "PENDIENTE";
        if (leido == null) leido = false;
    }
}