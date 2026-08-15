const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  college: { type: String, default: '' },
  course: { type: String, default: '' },
  year: { type: String, default: '' },
  skills: [{ type: String }],
  learningGoals: [{ type: String }],
  preferredStudyTime: { type: String, default: 'morning' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  badges: [{ type: String }],
  totalStudyHours: { type: Number, default: 0 },
  aiChats: { type: Number, default: 0 },
  pdfsUploaded: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
  roadmapsCreated: { type: Number, default: 0 },
  notesCreated: { type: Number, default: 0 },
  flashcardsGenerated: { type: Number, default: 0 },
  pinnedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
