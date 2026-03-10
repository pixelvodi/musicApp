const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

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
        ? `http://10.0.2.2:3000/static/img/${album.img}`
        : null  // если img пустой или null, не даём ссылку
    }));
    res.json(albums);
  });
});


app.listen(port, () => {
  console.log(`✅ Сервер запущен: http://localhost:${port}`);
});

app.use('/static', express.static(path.join(__dirname, 'public')));