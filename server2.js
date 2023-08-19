const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

async function dbSetup() {
  const setupPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',  // default postgres database
      password: 'postgres',
      port: 5432,
  });

  try {
      // Check if notesdb exists
      const dbExists = await setupPool.query("SELECT 1 FROM pg_database WHERE datname='notesdb'");

      if (dbExists.rowCount === 0) {
          // Create notesdb if it doesn't exist
          await setupPool.query('CREATE DATABASE notesdb;');
      }
  } catch (err) {
      console.error('Error checking/creating database:', err.message);
  }

  setupPool.end(); // Close the previous connection

  const notesPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'notesdb',
      password: 'postrges',
      port: 5432,
  });

  try {
      // Create the notes table
      await notesPool.query(`
          CREATE TABLE IF NOT EXISTS notes(
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              content TEXT
          );
      `);
  } catch (err) {
      console.error('Error creating table:', err.message);
      return null;  // If there's an error, return null
  }

  return notesPool;  // Return this pool for subsequent queries
}

const poolPromise = dbSetup();  // Call the setup function and get the pool promise

const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoints:

// Get all notes
app.get('/notes', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.query('SELECT * FROM notes');
    res.json(result.rows);
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
});

// Create a note
app.post('/notes', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { title, content } = req.body;
    const result = await pool.query('INSERT INTO notes(title, content) VALUES($1, $2) RETURNING *', [title, content]);
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
});

// Update a note
app.put('/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const pool = await poolPromise;
    const result = await pool.query('UPDATE notes SET title=$1, content=$2 WHERE id=$3 RETURNING *', [title, content, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
});

// Delete a note
app.delete('/notes/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
    res.send({ message: 'Note deleted successfully!' });
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Note app listening at http://localhost:${port}`);
});
