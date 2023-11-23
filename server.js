const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


const app = express();
dotenv.config(); 

const { MONGODB_URL, PORT } = process.env;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Note = mongoose.model('Note', noteSchema);

app.get('/api/notes', (req, res) => {
  Note.find({}).exec() // Execute the query
    .then(notes => {
      res.json(notes);
    })
    .catch(err => {
      return res.status(500).send('Internal Server Error');
    });
});

app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;
  console.log(title + " " + content)
  if (!title || !content) {
    return res.status(400).json({ error: 'Both title and content are required.' });
  }

  const newNote = new Note({ title, content });
  newNote.save()
    .then(() => {
      console.log('Note added successfully Server');
      res.status(201).json({ newNote });
    })
    .catch((error) => {
      console.error('Error saving note server:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});



app.delete('/api/notes/:noteId', async (req, res) => {
  const noteId = req.params.noteId;
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: noteId });

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting a note server:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Node API app is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB Connection Error:', error);
  });

