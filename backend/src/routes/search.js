const express = require('express');
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const Roadmap = require('../models/Roadmap');
const Quiz = require('../models/Quiz');
const Chat = require('../models/Chat');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ results: [] });
    const regex = new RegExp(q.trim(), 'i');
    const uid = req.user._id;

    const [notes, roadmaps, quizzes, chats] = await Promise.all([
      Note.find({ user: uid, $or: [{ title: regex }, { content: regex }] })
        .limit(5).select('title content updatedAt'),
      Roadmap.find({ user: uid, goal: regex })
        .limit(5).select('goal createdAt'),
      Quiz.find({ user: uid, $or: [{ title: regex }, { topic: regex }] })
        .limit(5).select('title topic createdAt'),
      Chat.find({ user: uid, archived: { $ne: true }, $or: [{ title: regex }, { lastMessage: regex }] })
        .limit(5).select('title lastMessage updatedAt'),
    ]);

    const results = [
      ...notes.map(n => ({ type: 'notes',   id: n._id, title: n.title,       description: n.content?.slice(0, 80) || '',    link: '/notes',   date: n.updatedAt })),
      ...roadmaps.map(r => ({ type: 'roadmap', id: r._id, title: r.goal,     description: 'Learning roadmap',               link: '/roadmap', date: r.createdAt })),
      ...quizzes.map(q => ({ type: 'quiz',    id: q._id, title: q.title,     description: `Topic: ${q.topic}`,              link: '/quiz',    date: q.createdAt })),
      ...chats.map(c => ({ type: 'chat',      id: c._id, title: c.title,     description: c.lastMessage?.slice(0, 80) || '', link: `/history/${c._id}`, date: c.updatedAt })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
