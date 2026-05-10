# Sigle-PacientesService

Microservicio del sistema SIGLE que escucha eventos de cancelación de citas desde RabbitMQ y genera notificaciones para los pacientes.

## Stack

- Java 17
- Spring Boot 3.2.5
- Spring Data JPA
- Spring AMQP (RabbitMQ)
- MySQL
- Lombok

## Requisitos

- Java 17+
- Maven 3.9+
- MySQL corriendo
- RabbitMQ corriendo en `localhost:5672`
- CitasService activo para que lleguen los eventos

## RabbitMQ local con Docker

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

## Configuración

```properties
server.port=8083
spring.datasource.url=jdbc:mysql://localhost:3306/sigle_pacientes?createDatabaseIfNotExist=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=tu_password
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

## Instalación

```bash
mvn clean package -DskipTests
java -jar target/pacientes-service-0.0.1-SNAPSHOT.jar
```

Disponible en `http://localhost:8083`

## Docker

```bash
docker build -t sigle-pacientes-service .
docker run -p 8083:10000 sigle-pacientes-service
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pacientes/notificaciones` | Todas las notificaciones |
| GET | `/api/pacientes/notificaciones/{pacienteId}` | Notificaciones de un paciente |

## Cómo funciona

Este servicio solo consume mensajes, no publica. Cuando CitasService cancela una cita, publica un evento en la queue `sigle.citas.canceladas`. El `CancelacionListener` de este servicio lo recibe y guarda la notificación en la BD.

```
CitasService → sigle.exchange → sigle.citas.canceladas → CancelacionListener → BD
```

El mensaje que se guarda como notificación es:

> "Estimado paciente, lamentamos informar que su cita ha sido cancelada por el siguiente motivo: [motivo]. Pronto será reasignado."

## Queue configurada

| Parámetro | Valor |
|---|---|
| Queue | `sigle.citas.canceladas` |
| Formato | JSON |

> El Exchange y Binding los define CitasService. Este servicio solo declara la queue.

## Health

```
GET http://localhost:8083/actuator/health
```

## Estructura

```
src/main/java/com/rednorte/sigle/pacientes_service/
├── config/
│   └── RabbitMQConfig.java
├── controller/
│   └── NotificacionController.java
├── listener/
│   └── CancelacionListener.java
├── model/
│   └── Notificacion.java
├── repository/
│   └── NotificacionRepository.java
└── service/
    └── NotificacionService.java
```
