# Sigle-PacientesService

Microservicio del sistema SIGLE (migrado de Spring Boot a Node.js) que escucha eventos de citas (creación y cancelación) desde RabbitMQ, guarda las notificaciones del paciente en BD y envía el correo real vía Nodemailer.

## Stack

- Node.js 20
- Express 5
- Sequelize + MySQL2
- amqplib (RabbitMQ)
- Nodemailer (envío de correos vía Gmail)
- axios (consulta el email del paciente en ListasService)
- Jest + Supertest (testing)
- pnpm (gestor de paquetes)

## Requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- MySQL corriendo
- RabbitMQ corriendo en `localhost:5672`
- CitasService activo para que lleguen los eventos
- ListasService activo (se consulta para obtener el email del paciente antes de enviar el correo)
- Una cuenta de Gmail con verificación en 2 pasos y una contraseña de aplicación generada (ver sección Correo)

## RabbitMQ local con Docker

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

Consola en `http://localhost:15672` (guest / guest)

## Variables de entorno

Copiar `.env.example` a `.env`:

```env
PORT=8083
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sigle_pacientes
DB_USER=root
DB_PASSWORD=tu_password
RABBITMQ_URL=amqp://guest:guest@localhost:5672

EUREKA_HOST=localhost
EUREKA_PORT=8761
INSTANCE_HOST=localhost

# Nodemailer (Gmail) - GMAIL_APP_PASSWORD se genera en
# https://myaccount.google.com/apppasswords (requiere verificación en 2 pasos activada)
GMAIL_USER=
GMAIL_APP_PASSWORD=
MAIL_FROM_NAME=SIGLE RedNorte

# URL de ListasService, usada para obtener el email del paciente al enviar notificaciones
LISTAS_SERVICE_URL=
```

## Instalación

> Usa siempre `pnpm`, no `npm install` — el proyecto usa `pnpm-lock.yaml` como único lockfile. Si ves un `package-lock.json` en el repo, elimínalo (quedó de una instalación accidental con npm, por ejemplo al instalar `nodemailer`/`axios`).

```bash
pnpm install
pnpm dev
```

Disponible en `http://localhost:8083`

## Correo (Nodemailer + Gmail)

Cuando se genera una notificación (`canal: 'EMAIL'`), el servicio:

1. Consulta el email del paciente en ListasService (`GET /api/listas/pacientes/:id`).
2. Si lo encuentra, envía el correo con Nodemailer usando la cuenta configurada en `GMAIL_USER` / `GMAIL_APP_PASSWORD`.
3. Marca la notificación como `ENVIADA` o `FALLIDA` según el resultado. 

Para generar la contraseña de aplicación:
1. Activa la verificación en 2 pasos en la cuenta de Gmail que vas a usar (idealmente una cuenta dedicada, no personal).
2. Ve a `https://myaccount.google.com/apppasswords`, crea una con cualquier nombre descriptivo.
3. Copia la contraseña de 16 caracteres a `GMAIL_APP_PASSWORD` (sin espacios).

## Docker

```bash
docker build -t sigle-pacientes-service .
docker run -p 8083:8083 sigle-pacientes-service
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pacientes/notificaciones` | Todas las notificaciones |
| GET | `/api/pacientes/notificaciones/:id` | Por ID |
| GET | `/api/pacientes/notificaciones/paciente/:pacienteId` | Notificaciones de un paciente |
| GET | `/api/pacientes/notificaciones/paciente/:pacienteId/no-leidas` | Notificaciones no leídas |
| PUT | `/api/pacientes/notificaciones/paciente/:pacienteId/marcar-leidas` | Marca todas como leídas |

Todas las rutas con `:pacienteId` o `:id` validan que sea un número válido; si no, retornan `400`.

## Cómo funciona

Este servicio no expone un endpoint para crear notificaciones manualmente: se generan solo a partir de eventos de RabbitMQ publicados por CitasService.

CitasService → sigle.exchange → sigle.citas.creadas    → creacionListener    → MySQL + correo
CitasService → sigle.exchange → sigle.citas.canceladas → cancelacionListener → MySQL + correo

| Listener | Queue | Tipo de notificación | Mensaje |
|---|---|---|---|
| `creacionListener` | `sigle.citas.creadas` | `CREACION_CITA` | "Estimado paciente, su cita de [especialidad] con el Dr(a). [médico] ha sido agendada exitosamente para el [fecha]." |
| `cancelacionListener` | `sigle.citas.canceladas` | `CANCELACION_CITA` | "Estimado paciente, lamentamos informar que su cita ha sido cancelada por el siguiente motivo: [motivo]. Pronto será reasignado." |

> El Exchange y los Bindings los define CitasService. Este servicio solo declara las queues y las consume.

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

## Health

GET http://localhost:8083/actuator/health

## Estructura
src/
├── app.js                     # configuración de Express (testeable)
├── index.js                   # entry point, conecta BD y arranca ambos listeners
├── config/
│   ├── database.js            # conexión Sequelize (SSL para Aiven)
│   ├── eureka.js
│   └── mailer.js               # transporter de Nodemailer con Gmail
├── controllers/
│   └── notificacionController.js
├── listeners/
│   ├── cancelacionListener.js  # escucha sigle.citas.canceladas
│   └── creacionListener.js     # escucha sigle.citas.creadas
├── models/
│   └── Notificacion.js
├── routes/
│   └── notificaciones.js
└── services/
├── notificacionService.js  # guarda la notificación y dispara el correo
├── emailService.js         # arma y envía el correo con Nodemailer
└── listasClient.js         # obtiene el email del paciente desde ListasService
tests/
└── notificaciones.test.js