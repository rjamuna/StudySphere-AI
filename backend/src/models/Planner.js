const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: String,
  dueDate: Date,
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  type: { type: String, enum: ['task', 'exam', 'assignment'], default: 'task' },
});

const plannerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tasks: [taskSchema],
  pomodoroSessions: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Planner', plannerSchema);
