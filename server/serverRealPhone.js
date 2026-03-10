const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { error } = require('console');
const { json } = require('stream/consumers');

const app = express();
const port = 3000;

// ⚠️ Замените этот IP на IP вашего ПК в локальной сети
const localIP = '192.168.1.2';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./musicapp.sqlite');

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

app.get('/', (req, res) => {
  res.send('Сервер работает, перейдите к /albums для получения данных');
});

app.get('/albums', (req, res) => {
  db.all(`SELECT 
          albums.album_id, 
          albums.name, 
          albums.img, 
          artists.name AS artist_name 
        FROM albums 
        INNER JOIN artists 
        ON albums.artist_id=artists.artist_id 
        ORDER BY RANDOM() 
        LIMIT 4 `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const albums = rows.map(album => ({
      id: album.album_id,
      name: album.name,
      imageUrl: album.img
        ? `http://${localIP}:${port}/static/img/${album.img}`
        : null,
      artist: album.artist_name
    }));
    res.json(albums);
  });
});

app.get('/albumsforhowaboutlisten', (req, res) => {
  db.all(
    `SELECT 
      albums.album_id, 
      albums.name, 
      albums.img AS album_img, 
      artists.name AS artist_name, 
      artists.img_artist AS artist_img,
      COUNT(tracks.track_id) AS track_count
    FROM albums 
    INNER JOIN artists ON albums.artist_id = artists.artist_id
    INNER JOIN tracks ON albums.album_id = tracks.album_id
    GROUP BY albums.album_id
    ORDER BY RANDOM() 
    LIMIT 1`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const albums = rows.map(album => ({
        id: album.album_id,
        name: album.name,
        imageUrl: album.album_img
          ? `http://${localIP}:${port}/static/img/${album.album_img}`
          : null,
        artist: album.artist_name,
        img_artist: album.artist_img
          ? `http://${localIP}:${port}/static/img/${album.artist_img}`
          : null,
        track_count: album.track_count
      }));

      res.json(albums);
    }
  );
});


app.get('/artist', (req, res) => {
  db.all(
    `SELECT
      artist_id,
      name,
      img_artist
    FROM
      artists `, [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});

        const artists = rows.map(artist => ({
          id: artist.artist_id,
          name: artist.name,
          img_artist: artist.img_artist
            ? `http://${localIP}:${port}/static/img/${artist.img_artist}`
            : null
        }));

        res.json(artists);
      }
  )
});

app.get('/albumsImg', (req, res) => {
  db.all('SELECT img FROM albums ORDER BY RANDOM()', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const albums = rows.map(album => ({
      imageUrl: album.img
        ? `http://${localIP}:${port}/static/img/${album.img}`
        : null,
    }));
    res.json(albums);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен: http://${localIP}:${port}`);
});

app.use('/static', express.static(path.join(__dirname, 'public')));


app.get('/tracks/:albumId', (req, res) => {
  const albumId = req.params.albumId;

  db.all(`
    SELECT 
      t.track_id,
      t.title,
      t.filename,
      a.name AS album_name,
      ar.name AS artist_name
    FROM tracks t
    JOIN albums a ON t.album_id = a.album_id
    JOIN artists ar ON a.artist_id = ar.artist_id
    WHERE t.album_id = ?
    ORDER BY t.track_id ASC;
  `, [albumId], (err, rows) => {
    if (err) {
      console.error('Ошибка SQL:', err.message);
      return res.status(500).json({ error: err.message });
    }

    // Формируем полный URL для каждого трека
    const tracks = rows.map(track => ({
      id: track.track_id,
      title: track.title,
      artist: track.artist_name,
      album: track.album_name,
      audioUrl: track.filename
        ? `http://${localIP}:${port}/static/music/${track.filename}`
        : null
    }));

    res.json(tracks);
  });
});

app.post('/getQueue', (req, res) => {
  const { queue } = req.body;



  const placeholders = queue.map(() => '?').join(',');

  db.all(
    `SELECT track_id, title, filename FROM tracks WHERE track_id IN (${placeholders})`,
    queue,
    (err, rows) => {
      if (err) {
        console.error('Ошибка SQL:', err.message);
        return res.status(500).json({ error: err.message });
      }

      const tracksQueue = rows.map(track => ({
        id: track.track_id,
        name: track.title,
        filename: track.filename
      }));

      console.log("Получено из запроса в БД:", tracksQueue);
      res.json(tracksQueue);
    }
  );
});

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
});


app.post('/users/register', (req, res) => {
  const { email, password } = req.body;
  console.log("User: ", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function (err) {
    if (err) {
      console.error('Ошибка при добавлении пользователя:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("Пользователь добавлен с id:", this.lastID);
    return res.status(201).json({ message: 'Регистрация успешна', userId: this.lastID });
  });
});

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  console.log("User: ", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Ошибка при добавлении пользователя:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if(!user) {
      console.log("Неверный email или пароль")
      return res.status(401).json({ error: 'Неверный email или пароль' });

    }
    if (user.password !== password) {
      console.log("❌ Неверный пароль");
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    console.log("✅ Авторизация успешна:", email);
    return res.json({ message: 'Авторизация успешна', userId: user.id });
  });
});

app.get('/search', async (req, res) => {
  const query = req.query.query?.trim();

  if (!query) {
    return res.json({ results: [] });
  }

  const q = `%${query.toLowerCase()}%`;
  const results = [];

  try {
    // 1. ПОИСК ТРЕКОВ
    const trackSearch = await dbAll(
      `SELECT 
        t.track_id AS id,
        t.title,
        t.filename,
        ar.name AS artist,
        a.img AS img,
        a.album_id,
        'track' AS type,
        1 AS priority
      FROM tracks t
      JOIN albums a ON t.album_id = a.album_id
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE LOWER(t.title) LIKE ?
      LIMIT 10
    `, [q]);

    const tracksWithUrl = trackSearch.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      img: track.img
        ? `http://${localIP}:${port}/static/img/${track.img}`
        : null,
      audioUrl: track.filename
        ? `http://${localIP}:${port}/static/music/${track.filename}` 
        : null,
      album_id: track.album_id,
      type: track.type,
      priority: track.priority
    }));

    results.push(...tracksWithUrl);

    // 2. ПОИСК АЛЬБОМОВ (без изменений)
    const albumsSearch = await dbAll(`
      SELECT 
        a.album_id AS id, 
        a.name AS title,
        ar.name AS artist, 
        a.img,
        'album' AS type, 
        2 AS priority
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE LOWER(a.name) LIKE ?
      LIMIT 10
    `, [q]);

    const albumsWithUrl = albumsSearch.map(album => ({
      id: album.id,
      title: album.title,
      artist: album.artist,
      img: album.img
        ? `http://${localIP}:${port}/static/img/${album.img}`
        : null,
      type: album.type,
      priority: album.priority
    }));

    results.push(...albumsWithUrl);

    // 3. ПОИСК АРТИСТОВ (без изменений)
    const artistsSearch = await dbAll(`
      SELECT 
        ar.artist_id AS id, 
        ar.name AS title,
        NULL AS img,
        'artist' AS type, 
        3 AS priority
      FROM artists ar
      WHERE LOWER(ar.name) LIKE ?
      LIMIT 5
    `, [q]);

    results.push(...artistsSearch);

    results.sort((a, b) => a.priority - b.priority);

    console.log(`Поиск "${query}": найдено ${tracksWithUrl.length} треков, ${albumsWithUrl.length} альбомов.`);

    res.json({ results });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});