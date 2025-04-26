const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rooms');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch rooms' });
  }
});

module.exports = router;  
