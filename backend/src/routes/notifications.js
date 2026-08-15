const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// MUST be before /:id route
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/seed', auth, async (req, res) => {
  try {
    const samples = [
      { type: 'exam',        title: 'Exam Tomorrow',         message: 'Mathematics exam is scheduled for tomorrow at 10 AM.', icon: '📝' },
      { type: 'achievement', title: 'Achievement Unlocked!', message: 'You earned the "7 Day Streak" badge. Keep it up!',      icon: '🏆' },
      { type: 'reminder',    title: 'Daily Study Reminder',  message: "Don't forget your 2-hour study session today.",         icon: '⏰' },
      { type: 'milestone',   title: 'Roadmap Milestone',     message: 'You completed Phase 1 of your React Learning roadmap!', icon: '🗺️' },
      { type: 'quiz',        title: 'Quiz Reminder',         message: 'You have a pending Python Basics quiz.',                icon: '🧠' },
    ];
    await Notification.insertMany(samples.map(s => ({ ...s, user: req.user._id })));
    res.json({ message: 'Seeded' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
