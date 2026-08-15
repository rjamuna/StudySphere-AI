const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: String,
  skillLevel: String,
  dailyHours: Number,
  targetDate: Date,
  content: { type: Object },
  progress: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
