const express = require('express');
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const Activity = require('../models/Activity');
const axios = require('axios');

const router = express.Router();

router.post('/generate', auth, async (req, res) => {
  try {
    const { goal, skillLevel, dailyHours, targetDate } = req.body;
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/roadmap/generate`,
      { goal, skillLevel, dailyHours, targetDate },
      { timeout: 60000 }
    );
    const roadmap = await Roadmap.create({
      user: req.user._id, goal, skillLevel, dailyHours, targetDate, content: aiRes.data,
    });
    // Update user stat
    await User.findByIdAndUpdate(req.user._id, { $inc: { roadmapsCreated: 1 } });
    // Log activity
    await Activity.create({
      user: req.user._id, type: 'roadmap',
      title: `Created roadmap: ${goal}`,
      description: `${skillLevel} level · ${dailyHours}h/day`,
      link: '/roadmap',
    });
    res.status(201).json(roadmap);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    res.json(await Roadmap.find({ user: req.user._id }).sort('-createdAt'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id, { progress: req.body.progress }, { new: true }
    );
    res.json(roadmap);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Roadmap.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
