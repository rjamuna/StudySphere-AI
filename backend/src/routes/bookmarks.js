const express = require('express');
const auth = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { type } = req.query;
  const filter = { user: req.user._id };
  if (type) filter.type = type;
  const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 });
  res.json(bookmarks);
});

router.post('/', auth, async (req, res) => {
  const { type, title, description, link, refId, tags } = req.body;
  const bookmark = await Bookmark.create({ user: req.user._id, type, title, description, link, refId, tags });
  res.status(201).json(bookmark);
});

router.delete('/:id', auth, async (req, res) => {
  await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
