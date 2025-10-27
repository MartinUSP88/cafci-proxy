// server.js

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 🔓 Habilitar CORS globalmente
app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Proxy CAFCI activo. Usá /cartera/:id o /cafci.');
});

// 🧠 Utilidad para timeout con AbortController
function fetchConTimeout(url, opciones = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const opcionesConSeñal = { ...opciones, signal: controller.signal };

  return fetch(url, opcionesConSeñal)
    .finally(() => clearTimeout(timeout));
}

// 🔁 Endpoint principal
app.get('/cartera/:id', async (req, res) => {
  const fondoId = req.params.id;
  const url = `https://api.cafci.org.ar/interfaz/semanal/resumen/cartera/${fondoId}`;

  try {
    const response = await fetchConTimeout(url, {
      headers: {
        'origin': 'https://www.cafci.org.ar',
        'referer': 'https://www.cafci.org.ar/',
        'user-agent': 'Mozilla/5.0'
      }
    }, 10000); // 10 segundos de timeout

    const data = await response.text();
    res.status(response.status).send(data);

  } catch (error) {
    console.error(`❌ Error al consultar ID ${fondoId}:`, error.message);
    const status = error.name === 'AbortError' ? 504 : 500;
    res.status(status).json({ error: `Fallo al consultar CAFCI (ID ${fondoId})`, detalle: error.message });
  }
});

// 🆕 Endpoint para Excel diario
app.get('/cafci', async (req, res) => {
  try {
    const response = await fetchConTimeout('https://api.pub.cafci.org.ar/pb_get', {}, 10000);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error al obtener el Excel de CAFCI' });
    }
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', response.headers.get('Content-Type'));
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('❌ Error al obtener pb_get:', err.message);
    const status = err.name === 'AbortError' ? 504 : 500;
    res.status(status).json({ error: 'Fallo al obtener pb_get', detalle: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy CAFCI escuchando en http://localhost:${PORT}`);
});


