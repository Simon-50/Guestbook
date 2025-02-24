import express from 'express';
import pg from 'pg';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Database
const db = new pg.Client({
    user: 'postgres',
    password: 'ec5Zmbnd',

    host: 'localhost',
    database: 'Guestbook',
    port: 5432
});
db.connect();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

const posts = [];
db.query('SELECT * FROM guestbook', (err, res) => {
    if (err) {
        console.error('Error querying database', err);
        return;
    }
    posts.push(...res.rows.map((row) => [row.namn, row.meddelande]));
});

app.get('/', (req, res) => {
    console.log(posts);
    res.render(`${__dirname}/views/index.ejs`, { guestbook: posts });
});

app.post('/add', (req, res) => {
    const { name, message } = req.body;

    console.log(name);
    console.log(message);

    db.query('INSERT INTO guestbook (namn, meddelande) VALUES ($1, $2)', [name, message]);
    posts.push([name, message]);

    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
