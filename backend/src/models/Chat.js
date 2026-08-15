const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  subject: { type: String, default: '' },
  messages: [messageSchema],
  pinned: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  lastMessage: { type: String, default: '' },
  messageCount: { type: Number, default: 0 },
  memoryContext: { type: String, default: '' },
}, { timestamps: true });

chatSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
