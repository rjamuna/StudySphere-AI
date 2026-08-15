const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Planner = require('../models/Planner');
const Note = require('../models/Note');
const Roadmap = require('../models/Roadmap');

const router = express.Router();

const ACHIEVEMENTS = [
  { id: '7day_streak', label: '7 Day Streak', icon: '🔥', condition: u => u.streak >= 7 },
  { id: '30day_streak', label: '30 Day Streak', icon: '⚡', condition: u => u.streak >= 30 },
  { id: '100_hours', label: '100 Study Hours', icon: '⏰', condition: u => u.totalStudyHours >= 100 },
  { id: 'quiz_master', label: 'Quiz Master', icon: '🧠', condition: u => u.quizzesCompleted >= 10 },
  { id: 'roadmap_explorer', label: 'Roadmap Explorer', icon: '🗺️', condition: u => u.roadmapsCreated >= 3 },
  { id: 'fast_learner', label: 'Fast Learner', icon: '🚀', condition: u => u.xp >= 500 },
  { id: 'ai_explorer', label: 'AI Explorer', icon: '🤖', condition: u => u.aiChats >= 20 },
  { id: 'pdf_genius', label: 'PDF Genius', icon: '📄', condition: u => u.pdfsUploaded >= 5 },
  { id: 'note_taker', label: 'Note Taker', icon: '📝', condition: u => u.notesCreated >= 10 },
];

router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const earned = ACHIEVEMENTS.filter(a => a.condition(user)).map(a => ({ id: a.id, label: a.label, icon: a.icon }));
  res.json({ ...user.toObject(), achievements: earned });
});

router.patch('/profile', auth, async (req, res) => {
  const allowed = ['name', 'avatar', 'bio', 'college', 'course', 'year', 'skills', 'learningGoals', 'preferredStudyTime'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  try {
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ message: 'Invalid password data' });
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const quizCount = await Quiz.countDocuments({ user: req.user._id, completed: true });
    const noteCount = await Note.countDocuments({ user: req.user._id });
    const roadmapCount = await Roadmap.countDocuments({ user: req.user._id });
    const planner = await Planner.findOne({ user: req.user._id });
    const completedTasks = planner?.tasks.filter(t => t.completed).length || 0;
    const earned = ACHIEVEMENTS.filter(a => a.condition({ ...user.toObject(), quizzesCompleted: quizCount, notesCreated: noteCount, roadmapsCreated: roadmapCount }))
      .map(a => ({ id: a.id, label: a.label, icon: a.icon }));
    res.json({
      xp: user.xp, level: user.level, streak: user.streak,
      totalStudyHours: user.totalStudyHours, aiChats: user.aiChats,
      pdfsUploaded: user.pdfsUploaded, quizzesCompleted: quizCount,
      roadmapsCreated: roadmapCount, notesCreated: noteCount,
      flashcardsGenerated: user.flashcardsGenerated,
      tasksCompleted: completedTasks, achievements: earned,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
