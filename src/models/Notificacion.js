const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    pacienteId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'paciente_id',
    },
    tipo: { type: DataTypes.STRING },
    canal: { type: DataTypes.STRING },
    mensaje: { type: DataTypes.TEXT },
    estado: { type: DataTypes.STRING, defaultValue: 'PENDIENTE' },
    intentos: { type: DataTypes.INTEGER, defaultValue: 0 },
    enviadoEn: { type: DataTypes.DATE, allowNull: true, field: 'enviado_en' },
    eventoOrigen: { type: DataTypes.STRING, allowNull: true, field: 'evento_origen' },
    creadoEn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'creado_en' },
}, {
    tableName: 'notificaciones',
    timestamps: false,
});

module.exports = Notificacion;