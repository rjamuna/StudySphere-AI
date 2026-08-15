require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/search', require('./routes/search'));
app.use('/api/chats', require('./routes/chats'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error(err); process.exit(1); });
