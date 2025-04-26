const express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Get all applications
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT applications.*, users.name, users.email FROM applications JOIN users ON applications.student_id = users.id'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Submit a new application
router.post('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { roomType, phone, gender } = req.body;

    if (!roomType || !phone || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const preferences = JSON.stringify({ roomType, phone, gender });

    await db.query(
      'INSERT INTO applications (student_id, preferences) VALUES ($1, $2)',
      [decoded.id, preferences]
    );

    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    console.error('Apply error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Application failed' });
  }
});

// Get the current student's application
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db.query(
      'SELECT * FROM applications WHERE student_id = $1 LIMIT 1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No application found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch application error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Could not fetch application' });
  }
});

// Update application status (for admin)
router.post('/process/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE applications SET status = $1 WHERE id = $2',
      [status, req.params.id]
    );
    res.json({ message: 'Application status updated' });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ error: 'Could not update status' });
  }
});

module.exports = router;
