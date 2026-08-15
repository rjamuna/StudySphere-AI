const express = require('express');
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const User = require('../models/User');
const Activity = require('../models/Activity');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { folder, search } = req.query;
    const query = { user: req.user._id };
    if (folder) query.folder = folder;
    if (search) query.$or = [{ title: new RegExp(search, 'i') }, { content: new RegExp(search, 'i') }];
    res.json(await Note.find(query).sort('-updatedAt'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const note = await Note.create({ user: req.user._id, ...req.body });
    // Update user stat
    await User.findByIdAndUpdate(req.user._id, { $inc: { notesCreated: 1 } });
    // Log activity
    await Activity.create({
      user: req.user._id, type: 'notes',
      title: `Created note: ${note.title || 'Untitled'}`,
      description: note.content?.slice(0, 80) || '',
      link: '/notes',
    });
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Not found' });
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
