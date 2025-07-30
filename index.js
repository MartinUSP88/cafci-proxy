// server.js

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

// 🔓 Habilitar CORS globalmente
app.use(cors());

app.get('/cartera/:id', async (req, res) => {
  const fondoId = req.params.id;
  const url = `https://api.cafci.org.ar/interfaz/semanal/resumen/cartera/${fondoId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'origin': 'https://www.cafci.org.ar',
        'referer': 'https://www.cafci.org.ar/',
        'user-agent': 'Mozilla/5.0'
      }
    });

    const data = await response.text();
    res.status(response.status).send(data);

  } catch (error) {
    console.error('Error al llamar a CAFCI:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

// 🆕 Nuevo endpoint para Excel diario
app.get('/cafci', async (req, res) => {
  try {
    const response = await fetch('https://api.cafci.org.ar/pb_get');
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error al obtener el Excel de CAFCI' });
    }
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', response.headers.get('Content-Type'));
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error al obtener pb_get:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy CAFCI escuchando en http://localhost:${PORT}`);
});
