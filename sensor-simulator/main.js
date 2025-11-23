require("dotenv").config();
const axios = require("axios");

const { API_BASE_URL, INTERVAL_MS } = process.env;

let SENSOR_SERVICE_TOKEN = null;

async function fetchSensorToken() {
  try {
    const res = await axios.get(`${API_BASE_URL}/dev/generate-sensor-token`);
    SENSOR_SERVICE_TOKEN = res.data.token;
    console.log("Token do serviço de sensores obtido com sucesso!");
  } catch (err) {
    console.error(
      "Erro ao obter token do serviço de sensores:",
      err.response?.data || err.message
    );
  }
}

function getHeaders() {
  return {
    Authorization: `Bearer ${SENSOR_SERVICE_TOKEN}`
  };
}

async function getSensors() {
  try {
    const res = await axios.get(`${API_BASE_URL}/sensor-service/sensors`, {
      headers: getHeaders(),
    });
    const sensores = res.data;
    return sensores.filter((s) => s.status_sensor === "Ativo");
  } catch (err) {
    console.error("Erro ao buscar sensores:", err.response?.data || err.message);
    return [];
  }
}

async function sendReading(id_sensor, valor) {
  try {
    await axios.post(
      `${API_BASE_URL}/sensor-service/readings`,
      {
        id_sensor_autor: id_sensor,
        valor,
      },
      {
        headers: getHeaders(),
      }
    );

    console.log(`Sensor ${id_sensor} - valor: ${valor}`);
  } catch (err) {
    console.error(`Erro ao enviar leitura do sensor ${id_sensor}):`,err.response?.data || err.message);
  }
}

function generateRandomValue(sensor) {
  return Number((Math.random() * (sensor.limite + 20)).toFixed(2));
}

async function loop() {
  if (!SENSOR_SERVICE_TOKEN) {
    console.log("Token ausente. Buscando novamente...");
    await fetchSensorToken();
  }
  console.log("Buscando sensores ativos...");
  const sensores = await getSensors();
  if (sensores.length === 0) {
    console.log("Nenhum sensor ativo encontrado.");
    return;
  }
  console.log(`${sensores.length} sensores ativos encontrados.`);
  for (const sensor of sensores) {
    const valor = generateRandomValue(sensor);
    await sendReading(sensor.id_sensor, valor);
  }
}

async function init() {
  console.log("🚀 Iniciando Sensor Simulator...");
  await fetchSensorToken();
  await loop();
  setInterval(loop, INTERVAL_MS || 300000); // Padrão 5 minutos
}

init();
