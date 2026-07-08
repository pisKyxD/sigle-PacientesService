const axios = require('axios');

const LISTAS_URL = process.env.LISTAS_SERVICE_URL || 'https://sigle-listasservice.onrender.com';


const getPacienteById = async (pacienteId) => {
  try {
    const res = await axios.get(`${LISTAS_URL}/api/listas/pacientes/${pacienteId}`, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error(`[ListasClient] No se pudo obtener el paciente ${pacienteId}:`, err.message);
    return null;
  }
};

module.exports = { getPacienteById };