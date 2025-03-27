import express from 'express';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const saltRounds = 12;

// Database
const db = new pg.Client({
    user: 'postgres',
    password: 'password',

    host: 'localhost',
    database: 'Guestbook',
    port: 5432
});
db.connect();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

const posts = [];
db.query('SELECT * FROM Guestbook', (err, res) => {
    if (err) {
        console.error('Error querying database', err);
        return;
    }
    posts.push(...res.rows.map((row) => [row.namn, row.meddelande]));
});

app.get('/', (_req, res) => {
    res.render(`${__dirname}/views/index.ejs`, { guestbook: posts });
});

app.get('/login', (_req, res) => {
    res.render(`${__dirname}/views/login.ejs`, { message: null});
});

app.get('/admin', async (_req, res) => {
    const result = await db.query('SELECT * FROM Guestbook ORDER BY id');
    res.render(`${__dirname}/views/admin.ejs`, { guestbook: result.rows });
});

app.post('/add', (req, res) => {
    const { name, message } = req.body;

    console.log(name);
    console.log(message);
    console.log();

    db.query('INSERT INTO guestbook (namn, meddelande) VALUES ($1, $2)', [name, message]);
    posts.push([name, message]);

    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { admin_name, password } = req.body;

    if (
        admin_name === 'admin' &&
        (await bcrypt.compare(
            password,
            '$2b$12$sC67WBk6jzxPxKH3cN.EaewSbFJ/NRFeMxnCLXlH88pv9FvDdx/We'
        ))
    ) {
        res.redirect('/admin');
    } else {
        res.render(`${__dirname}/views/login.ejs`, { message: 'Fel användarnamn eller lösenord'});
    }
});

app.post('/update/:id', async (req, res) => {
    const id = req.params.id;
    const message = req.body['updatedMsg'];

    await db.query('UPDATE guestbook SET meddelande = $2 WHERE id = $1', [id, message]);

    res.redirect('/admin');
});

app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    await db.query('DELETE FROM Guestbook WHERE id = $1', [id]);

    const result = await db.query('SELECT * FROM Guestbook');
    res.render(`${__dirname}/views/admin.ejs`, { guestbook: result.rows });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
