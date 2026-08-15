const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tags: [String],
  folder: { type: String, default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
