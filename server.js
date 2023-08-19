const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Setup sequelize
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
});

// Define the Note model
const Note = sequelize.define('Note', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  },
});

// Endpoints

app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.findAll();
    res.json(notes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/notes', async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.json(note);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/notes/:id', async (req, res) => {
  try {
    await Note.update(req.body, {
      where: { id: req.params.id },
    });
    const updatedNote = await Note.findByPk(req.params.id);
    res.json(updatedNote);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/notes/:id', async (req, res) => {
  try {
    await Note.destroy({
      where: { id: req.params.id },
    });
    res.send({ message: 'Note deleted successfully!' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Sync the models and start the server
sequelize.sync({ alter: true }).then(() => {
  app.listen(port, () => {
    console.log(`Note app listening at http://localhost:${port}`);
  });
});