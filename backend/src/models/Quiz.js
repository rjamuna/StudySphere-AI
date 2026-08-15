const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  type: { type: String, enum: ['mcq', 'truefalse', 'fillin'] },
  options: [String],
  answer: String,
});

const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  topic: String,
  questions: [questionSchema],
  score: Number,
  completed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
