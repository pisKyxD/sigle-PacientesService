package com.rednorte.sigle.pacientes_service.controller;

import com.rednorte.sigle.pacientes_service.service.NotificacionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;   // IMPORT NECESARIO
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status; // IMPORT NECESARIO

@WebMvcTest(NotificacionController.class)
@ActiveProfiles("test")
class NotificacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificacionService notificacionService;

    @Test
    void deberiaObtenerListaDeNotificaciones() throws Exception {
        mockMvc.perform(get("/api/pacientes/notificaciones"))
               .andExpect(status().isOk());
    }
}
