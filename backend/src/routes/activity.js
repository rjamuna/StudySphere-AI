const express = require('express');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(activities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { type, title, description, link, meta } = req.body;
    if (!type || !title) return res.status(400).json({ message: 'type and title are required' });
    const activity = await Activity.create({
      user: req.user._id, type, title,
      description: description || '',
      link: link || '',
      meta: meta || {},
    });
    res.status(201).json(activity);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Activity.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
