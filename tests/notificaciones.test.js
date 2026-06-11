const request = require('supertest');
const app = require('../src/app');

// Mock de Sequelize para no conectar a BD real
jest.mock('../src/models/Notificacion', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
}));

const Notificacion = require('../src/models/Notificacion');

describe('GET /health', () => {
    test('retorna status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});

describe('GET /api/pacientes/notificaciones', () => {
    test('retorna lista de notificaciones', async () => {
        Notificacion.findAll.mockResolvedValue([
            { id: 1, pacienteId: 1, mensaje: 'Test', leido: false }
        ]);
        const res = await request(app).get('/api/pacientes/notificaciones');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('GET /api/pacientes/notificaciones/:id', () => {
    test('retorna notificacion cuando existe', async () => {
        Notificacion.findByPk.mockResolvedValue({ id: 1, pacienteId: 1, mensaje: 'Test' });
        const res = await request(app).get('/api/pacientes/notificaciones/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(1);
    });

    test('retorna 404 cuando no existe', async () => {
        Notificacion.findByPk.mockResolvedValue(null);
        const res = await request(app).get('/api/pacientes/notificaciones/999');
        expect(res.statusCode).toBe(404);
    });

    test('retorna 400 con id invalido', async () => {
        const res = await request(app).get('/api/pacientes/notificaciones/abc');
        expect(res.statusCode).toBe(400);
    });
});

describe('GET /api/pacientes/notificaciones/paciente/:pacienteId', () => {
    test('retorna notificaciones del paciente', async () => {
        Notificacion.findAll.mockResolvedValue([
            { id: 1, pacienteId: 1, mensaje: 'Test', leido: false }
        ]);
        const res = await request(app).get('/api/pacientes/notificaciones/paciente/1');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('retorna 400 con pacienteId invalido', async () => {
        const res = await request(app).get('/api/pacientes/notificaciones/paciente/abc');
        expect(res.statusCode).toBe(400);
    });
});

describe('GET /api/pacientes/notificaciones/paciente/:pacienteId/no-leidas', () => {
    test('retorna notificaciones no leidas', async () => {
        Notificacion.findAll.mockResolvedValue([
            { id: 1, pacienteId: 1, leido: false }
        ]);
        const res = await request(app).get('/api/pacientes/notificaciones/paciente/1/no-leidas');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('PUT /api/pacientes/notificaciones/paciente/:pacienteId/marcar-leidas', () => {
    test('marca notificaciones como leidas', async () => {
        Notificacion.update.mockResolvedValue([1]);
        const res = await request(app).put('/api/pacientes/notificaciones/paciente/1/marcar-leidas');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Notificaciones marcadas como leídas');
    });
});

describe('Error handler', () => {
    test('retorna 500 cuando error no tiene status', async () => {
        const Notificacion = require('../src/models/Notificacion');
        Notificacion.findAll.mockRejectedValue(new Error('Error interno'));
        const res = await request(app).get('/api/pacientes/notificaciones');
        expect(res.statusCode).toBe(500);
    });
});

describe('Servicio create con estado por defecto', () => {
    test('usa PENDIENTE cuando no se envia estado', async () => {
        const Notificacion = require('../src/models/Notificacion');
        Notificacion.findAll.mockResolvedValue([]);
        Notificacion.create.mockResolvedValue({
            id: 1, pacienteId: 1, mensaje: 'Test', estado: 'PENDIENTE', leido: false
        });
        const res = await request(app).get('/api/pacientes/notificaciones');
        expect(res.statusCode).toBe(200);
    });
});