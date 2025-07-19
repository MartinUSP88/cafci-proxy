// server.js

import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Servidor proxy CAFCI escuchando en http://localhost:${PORT}`);
});
