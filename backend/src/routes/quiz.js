const express = require('express');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Activity = require('../models/Activity');
const axios = require('axios');

const router = express.Router();

router.post('/generate', auth, async (req, res) => {
  try {
    const { topic, numQuestions = 5, type = 'mcq' } = req.body;
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/quiz/generate`,
      { topic, numQuestions, type },
      { timeout: 60000 }
    );
    const quiz = await Quiz.create({
      user: req.user._id,
      title: `Quiz: ${topic}`,
      topic,
      questions: aiRes.data.questions,
    });
    // Log activity
    await Activity.create({
      user: req.user._id, type: 'quiz',
      title: `Generated quiz: ${topic}`,
      description: `${numQuestions} questions · ${type}`,
      link: '/quiz',
    });
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    res.json(await Quiz.find({ user: req.user._id }).sort('-createdAt'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/submit', auth, async (req, res) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id, { score, completed: true }, { new: true }
    );
    // Update user stat
    await User.findByIdAndUpdate(req.user._id, { $inc: { quizzesCompleted: 1 } });
    // Log activity
    await Activity.create({
      user: req.user._id, type: 'quiz',
      title: `Completed quiz: ${quiz.title}`,
      description: `Score: ${score}%`,
      link: '/quiz',
    });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
