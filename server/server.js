require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const localIP = process.env.SERVER_IP || '192.168.1.100';

app.use(cors());

const db = new sqlite3.Database('./musicapp.sqlite');

app.get('/', (req, res) => {
  res.send('Сервер работает, перейдите к /albums для получения данных');
});


app.get('/albums', (req, res) => {
  db.all('SELECT * FROM albums ORDER BY RANDOM() LIMIT 4', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const albums = rows.map(album => ({
      id: album.id,
      name: album.name,
      imageUrl: album.img
        ? `http://${localIP}:${port}/static/img/${album.img}`
        : null
    }));
    res.json(albums);
  });
});


app.listen(port, () => {
  console.log(`✅ Сервер запущен: http://localhost:${port}`);
});

app.use('/static', express.static(path.join(__dirname, 'public')));