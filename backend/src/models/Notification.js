const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['exam', 'assignment', 'reminder', 'milestone', 'achievement', 'quiz', 'system'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  icon: { type: String, default: '🔔' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
