# Sigle-PacientesService

Microservicio del sistema SIGLE (migrado de Spring Boot a Node.js) que escucha eventos de cancelación de citas desde RabbitMQ y genera notificaciones para los pacientes.

## Stack

- Node.js 20
- Express 5
- Sequelize + MySQL2
- amqplib (RabbitMQ)
- Jest + Supertest (testing)
- pnpm (gestor de paquetes)

## Requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- MySQL corriendo
- RabbitMQ corriendo en `localhost:5672`
- CitasService activo para que lleguen los eventos

## RabbitMQ local con Docker

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

Consola en `http://localhost:15672` (guest / guest)

## Variables de entorno

Copiar `.env.example` a `.env`:

```env
PORT=10000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sigle_pacientes
DB_USER=root
DB_PASSWORD=tu_password
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Instalación

```bash
pnpm install
pnpm start
```

Disponible en `http://localhost:10000`

## Tests

```bash
pnpm test
```

Corre con Jest + Supertest, usando mocks del modelo Sequelize (no requiere BD real).

### Tests con Docker

```bash
docker build -f Dockerfile.test -t pacientes-tests .
docker run --rm pacientes-tests
```

## Docker

```bash
docker build -t sigle-pacientes-service .
docker run -p 10000:10000 sigle-pacientes-service
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pacientes/notificaciones` | Todas las notificaciones |
| GET | `/api/pacientes/notificaciones/{id}` | Por ID |
| GET | `/api/pacientes/notificaciones/paciente/{pacienteId}` | Notificaciones de un paciente |
| GET | `/api/pacientes/notificaciones/paciente/{pacienteId}/no-leidas` | Notificaciones no leídas |
| PUT | `/api/pacientes/notificaciones/paciente/{pacienteId}/marcar-leidas` | Marca todas como leídas |

Todas las rutas con `{pacienteId}` o `{id}` validan que sea un número válido; si no, retornan `400`.

## Cómo funciona

Este servicio consume eventos y expone notificaciones. Cuando CitasService cancela una cita, publica un evento en la queue `sigle.citas.canceladas`. El `cancelacionListener` de este servicio lo recibe y guarda la notificación en la BD vía Sequelize.

```
CitasService → sigle.exchange → sigle.citas.canceladas → cancelacionListener → MySQL
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
GET http://localhost:10000/health
```

## Estructura

```
src/
├── app.js                  # configuración de Express (testeable)
├── index.js                # entry point, conecta BD y arranca servidor
├── config/
│   └── database.js         # conexión Sequelize (SSL para Aiven)
├── controllers/
│   └── notificacionController.js
├── listeners/
│   └── cancelacionListener.js
├── models/
│   └── Notificacion.js
├── routes/
│   └── notificaciones.js
└── services/
    └── notificacionService.js
tests/
└── notificaciones.test.js
```