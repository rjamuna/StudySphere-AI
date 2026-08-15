const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const form = new FormData();
    form.append('pdf', fs.createReadStream(req.file.path), req.file.originalname);
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/pdf/process`, form,
      { headers: form.getHeaders(), timeout: 60000 }
    );
    fs.unlinkSync(req.file.path);
    // Update user stat
    await User.findByIdAndUpdate(req.user._id, { $inc: { pdfsUploaded: 1 } });
    // Log activity
    await Activity.create({
      user: req.user._id, type: 'pdf',
      title: `Uploaded PDF: ${req.file.originalname}`,
      description: `${Math.round(req.file.size / 1024)} KB`,
      link: '/pdf',
    });
    res.json(aiRes.data);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
});

router.post('/ask', auth, async (req, res) => {
  try {
    const { question, context } = req.body;
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/pdf/ask`,
      { question, context },
      { timeout: 60000 }
    );
    res.json(aiRes.data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
