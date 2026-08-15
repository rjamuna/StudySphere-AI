const express = require('express');
const auth = require('../middleware/auth');
const Planner = require('../models/Planner');

const router = express.Router();

const getOrCreate = async (userId) => {
  let planner = await Planner.findOne({ user: userId });
  if (!planner) planner = await Planner.create({ user: userId, tasks: [] });
  return planner;
};

router.get('/', auth, async (req, res) => {
  try {
    res.json(await getOrCreate(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/task', auth, async (req, res) => {
  try {
    const planner = await getOrCreate(req.user._id);
    planner.tasks.push(req.body);
    await planner.save();
    res.status(201).json(planner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/task/:taskId', auth, async (req, res) => {
  try {
    const planner = await Planner.findOne({ user: req.user._id });
    const task = planner.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    Object.assign(task, req.body);
    await planner.save();
    res.json(planner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/task/:taskId', auth, async (req, res) => {
  try {
    const planner = await Planner.findOne({ user: req.user._id });
    planner.tasks.pull({ _id: req.params.taskId });
    await planner.save();
    res.json(planner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
