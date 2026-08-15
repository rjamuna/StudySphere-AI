const express = require('express');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Activity = require('../models/Activity');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { archived, search, subject } = req.query;
    const query = { user: req.user._id };
    if (archived === 'true') query.archived = true;
    else query.archived = { $ne: true };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { lastMessage: { $regex: search, $options: 'i' } },
    ];
    if (subject) query.subject = subject;
    const chats = await Chat.find(query).select('-messages').sort({ pinned: -1, updatedAt: -1 });
    res.json(chats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/memory/context', auth, async (req, res) => {
  try {
    const recent = await Chat.find({ user: req.user._id, archived: { $ne: true } })
      .sort({ updatedAt: -1 }).limit(3).select('title memoryContext subject');
    const memory = recent.map(c => `[${c.title}]: ${c.memoryContext}`).join('\n\n');
    res.json({ memory });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Not found' });
    res.json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, subject, messages } = req.body;
    const chat = await Chat.create({
      user: req.user._id,
      title: title || 'New Chat',
      subject: subject || '',
      messages: messages || [],
      lastMessage: messages?.[messages.length - 1]?.content?.slice(0, 120) || '',
      messageCount: messages?.length || 0,
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { aiChats: 1 } });
    await Activity.create({
      user: req.user._id, type: 'chat',
      title: `Started chat: ${chat.title}`,
      description: chat.lastMessage || '',
      link: `/history/${chat._id}`,
    });
    res.status(201).json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { role, content } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Not found' });
    chat.messages.push({ role, content });
    chat.lastMessage = content.slice(0, 120);
    chat.messageCount = chat.messages.length;
    if (chat.messages.length === 1 && role === 'user') chat.title = content.slice(0, 60);
    chat.memoryContext = chat.messages.slice(-6).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');
    await chat.save();
    res.json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, subject, pinned, favorite, archived } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (subject !== undefined) updates.subject = subject;
    if (pinned !== undefined) updates.pinned = pinned;
    if (favorite !== undefined) updates.favorite = favorite;
    if (archived !== undefined) updates.archived = archived;
    const chat = await Chat.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true }).select('-messages');
    if (!chat) return res.status(404).json({ message: 'Not found' });
    res.json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const orig = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!orig) return res.status(404).json({ message: 'Not found' });
    const copy = await Chat.create({
      user: req.user._id, title: `${orig.title} (Copy)`,
      subject: orig.subject, messages: orig.messages,
      lastMessage: orig.lastMessage, messageCount: orig.messageCount,
    });
    res.status(201).json(copy);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
